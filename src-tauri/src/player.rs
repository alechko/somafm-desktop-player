//! Native stream playback. The webview always plays through the system default
//! output, so audio is decoded and played here to let the player use its own device.

use std::{
  num::NonZero,
  sync::mpsc::{self, RecvTimeoutError, TryRecvError},
  thread,
  time::Duration,
};

use rodio::{
  cpal::{self, traits::HostTrait},
  ChannelCount, DeviceSinkBuilder, DeviceTrait, MixerDeviceSink, Player, SampleRate, Source,
};
use serde::Serialize;
use symphonia::core::{
  codecs::audio::AudioDecoderOptions,
  errors::Error as DecodeError,
  formats::{probe::Hint, FormatOptions, TrackType},
  io::{MediaSourceStream, ReadOnlySource},
  meta::MetadataOptions,
};

const USER_AGENT: &str = concat!("SomaFM Desktop Player/", env!("CARGO_PKG_VERSION"));
/// Decoded packets (~26ms each) queued before playback starts, to ride out network jitter
const PREBUFFER_PACKETS: usize = 16;
const QUEUE_PACKETS: usize = 64;
const RETRY_DELAY: Duration = Duration::from_secs(2);
/// How often to check whether the system default output changed
const DEFAULT_DEVICE_POLL: Duration = Duration::from_secs(2);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OutputDevice {
  id: String,
  name: String,
  is_default: bool,
}

enum Command {
  Play(String),
  Stop,
  SetVolume(f32),
  SetDevice(Option<String>),
  /// A stream has buffered enough to start playing
  Ready(u64, StreamSource),
  /// A stream failed or ended; retried while it is still the current one
  Ended(u64, String),
  Retry(u64),
}

/// Handle to the audio thread, kept in Tauri's managed state
pub struct AudioPlayer {
  tx: mpsc::Sender<Command>,
}

impl AudioPlayer {
  pub fn new() -> Self {
    let (tx, rx) = mpsc::channel();
    let engine = Engine::new(tx.clone());
    thread::spawn(move || engine.run(rx));
    Self { tx }
  }

  fn send(&self, command: Command) -> Result<(), String> {
    self.tx.send(command).map_err(|_| "audio thread stopped".to_string())
  }
}

#[tauri::command]
pub fn player_play(url: String, player: tauri::State<AudioPlayer>) -> Result<(), String> {
  player.send(Command::Play(url))
}

#[tauri::command]
pub fn player_stop(player: tauri::State<AudioPlayer>) -> Result<(), String> {
  player.send(Command::Stop)
}

#[tauri::command]
pub fn player_set_volume(volume: f32, player: tauri::State<AudioPlayer>) -> Result<(), String> {
  player.send(Command::SetVolume(volume.clamp(0.0, 1.0)))
}

/// `None` follows the system default output
#[tauri::command]
pub fn player_set_device(device: Option<String>, player: tauri::State<AudioPlayer>) -> Result<(), String> {
  player.send(Command::SetDevice(device))
}

#[tauri::command]
pub fn list_output_devices() -> Result<Vec<OutputDevice>, String> {
  let host = cpal::default_host();
  let default_id = host.default_output_device().and_then(|d| device_id(&d));
  let devices = host.output_devices().map_err(|e| e.to_string())?;
  Ok(
    devices
      .filter_map(|device| {
        let id = device_id(&device)?;
        let name = device.description().ok()?.name().to_string();
        let is_default = default_id.as_deref() == Some(id.as_str());
        Some(OutputDevice { id, name, is_default })
      })
      .collect(),
  )
}

fn device_id(device: &cpal::Device) -> Option<String> {
  device.id().ok().map(|id| id.to_string())
}

fn find_device(id: &str) -> Option<cpal::Device> {
  cpal::default_host()
    .output_devices()
    .ok()?
    .find(|device| device_id(device).as_deref() == Some(id))
}

struct Output {
  sink: MixerDeviceSink,
  device_id: Option<String>,
}

/// Owns the output device and current stream; runs on its own thread
struct Engine {
  tx: mpsc::Sender<Command>,
  url: Option<String>,
  volume: f32,
  device: Option<String>,
  output: Option<Output>,
  player: Option<Player>,
  /// Bumped on every (re)start so messages from old streams are ignored
  generation: u64,
}

impl Engine {
  fn new(tx: mpsc::Sender<Command>) -> Self {
    Self {
      tx,
      url: None,
      volume: 1.0,
      device: None,
      output: None,
      player: None,
      generation: 0,
    }
  }

  fn run(mut self, rx: mpsc::Receiver<Command>) {
    loop {
      match rx.recv_timeout(DEFAULT_DEVICE_POLL) {
        Ok(command) => self.handle(command),
        Err(RecvTimeoutError::Timeout) => self.follow_default_device(),
        Err(RecvTimeoutError::Disconnected) => break,
      }
    }
  }

  fn handle(&mut self, command: Command) {
    match command {
      Command::Play(url) => {
        self.url = Some(url);
        self.start();
      }
      Command::Stop => {
        self.url = None;
        self.generation += 1;
        self.player = None;
        self.output = None;
      }
      Command::SetVolume(volume) => {
        self.volume = volume;
        if let Some(player) = &self.player {
          player.set_volume(volume);
        }
      }
      Command::SetDevice(device) => {
        self.device = device;
        self.output = None;
        if self.url.is_some() {
          self.start();
        }
      }
      Command::Ready(generation, source) => {
        if generation == self.generation {
          if let Some(player) = &self.player {
            player.append(source);
          }
        }
      }
      Command::Ended(generation, error) => {
        if generation == self.generation && self.url.is_some() {
          log::warn!("stream stopped, reconnecting: {error}");
          let tx = self.tx.clone();
          thread::spawn(move || {
            thread::sleep(RETRY_DELAY);
            let _ = tx.send(Command::Retry(generation));
          });
        }
      }
      Command::Retry(generation) => {
        if generation == self.generation && self.url.is_some() {
          self.start();
        }
      }
    }
  }

  /// (Re)starts the current stream on the selected output
  fn start(&mut self) {
    let Some(url) = self.url.clone() else { return };
    self.generation += 1;
    // Dropping the old player stops it, which also ends its download thread
    self.player = None;

    if self.output.is_none() {
      match open_output(self.device.as_deref()) {
        Ok(output) => self.output = Some(output),
        Err(e) => {
          log::error!("could not open audio output: {e}");
          return;
        }
      }
    }
    let Some(output) = &self.output else { return };
    let player = Player::connect_new(output.sink.mixer());
    player.set_volume(self.volume);
    self.player = Some(player);

    let (generation, tx) = (self.generation, self.tx.clone());
    thread::spawn(move || {
      if let Err(e) = stream(&url, generation, &tx) {
        let _ = tx.send(Command::Ended(generation, e));
      }
    });
  }

  /// With no device selected, move playback along when the system default changes
  fn follow_default_device(&mut self) {
    if self.device.is_some() || self.player.is_none() {
      return;
    }
    let Some(output) = &self.output else { return };
    let current = cpal::default_host().default_output_device().and_then(|d| device_id(&d));
    if current.is_some() && current != output.device_id {
      self.output = None;
      self.start();
    }
  }
}

fn open_output(device: Option<&str>) -> Result<Output, String> {
  // A selected device that's gone (e.g. unplugged headphones) falls back to the default
  let device = device
    .and_then(find_device)
    .or_else(|| cpal::default_host().default_output_device())
    .ok_or("no audio output device")?;
  let device_id = device_id(&device);
  let builder = DeviceSinkBuilder::from_device(device).map_err(|e| e.to_string())?;
  let mut sink = builder.open_sink_or_fallback().map_err(|e| e.to_string())?;
  sink.log_on_drop(false);
  Ok(Output { sink, device_id })
}

/// Downloads and decodes a stream, feeding samples to the player until it's stopped.
/// Returns Ok when playback was stopped, Err when the stream failed or ended.
fn stream(url: &str, generation: u64, commands: &mpsc::Sender<Command>) -> Result<(), String> {
  let response = ureq::get(url)
    .header("User-Agent", USER_AGENT)
    .call()
    .map_err(|e| e.to_string())?;
  let reader = response.into_body().into_reader();
  let source = MediaSourceStream::new(Box::new(ReadOnlySource::new(reader)), Default::default());

  let mut hint = Hint::new();
  hint.with_extension("mp3");
  let mut format = symphonia::default::get_probe()
    .probe(&hint, source, FormatOptions::default(), MetadataOptions::default())
    .map_err(|e| e.to_string())?;
  let track = format.first_track(TrackType::Audio).ok_or("no audio track")?;
  let track_id = track.id;
  let params = track
    .codec_params
    .as_ref()
    .and_then(|params| params.audio())
    .ok_or("not an audio stream")?
    .clone();
  let mut decoder = symphonia::default::get_codecs()
    .make_audio_decoder(&params, &AudioDecoderOptions::default())
    .map_err(|e| e.to_string())?;

  let (samples_tx, samples_rx) = mpsc::sync_channel::<Vec<f32>>(QUEUE_PACKETS);
  let mut samples_rx = Some(samples_rx);
  let mut queued = 0;

  loop {
    let packet = match format.next_packet() {
      Ok(Some(packet)) => packet,
      Ok(None) => return Err("stream ended".into()),
      Err(e) => return Err(e.to_string()),
    };
    if packet.track_id != track_id {
      continue;
    }
    let decoded = match decoder.decode(&packet) {
      Ok(decoded) => decoded,
      // A corrupt frame is skipped rather than ending the stream
      Err(DecodeError::DecodeError(_)) => continue,
      Err(e) => return Err(e.to_string()),
    };
    let spec = decoded.spec();
    let (channels, rate) = (spec.channels().count() as u16, spec.rate());
    let mut samples = Vec::new();
    decoded.copy_to_vec_interleaved(&mut samples);

    // The player dropped its end of the queue: playback was stopped
    if samples_tx.send(samples).is_err() {
      return Ok(());
    }
    queued += 1;
    if queued == PREBUFFER_PACKETS {
      if let Some(rx) = samples_rx.take() {
        let source = StreamSource::new(rx, channels, rate).ok_or("invalid audio format")?;
        commands.send(Command::Ready(generation, source)).map_err(|e| e.to_string())?;
      }
    }
  }
}

/// A rodio source reading decoded samples from the download thread
struct StreamSource {
  rx: mpsc::Receiver<Vec<f32>>,
  buffer: Vec<f32>,
  position: usize,
  channels: ChannelCount,
  rate: SampleRate,
}

impl StreamSource {
  fn new(rx: mpsc::Receiver<Vec<f32>>, channels: u16, rate: u32) -> Option<Self> {
    Some(Self {
      rx,
      buffer: Vec::new(),
      position: 0,
      channels: NonZero::new(channels)?,
      rate: NonZero::new(rate)?,
    })
  }
}

impl Iterator for StreamSource {
  type Item = f32;

  fn next(&mut self) -> Option<f32> {
    loop {
      if let Some(&sample) = self.buffer.get(self.position) {
        self.position += 1;
        return Some(sample);
      }
      self.position = 0;
      self.buffer = match self.rx.try_recv() {
        Ok(samples) => samples,
        // Network underrun: play one frame of silence instead of blocking the audio callback
        Err(TryRecvError::Empty) => vec![0.0; self.channels.get() as usize],
        Err(TryRecvError::Disconnected) => return None,
      };
    }
  }
}

impl Source for StreamSource {
  // Channel count and sample rate don't change within a stream
  fn current_span_len(&self) -> Option<usize> {
    None
  }

  fn channels(&self) -> ChannelCount {
    self.channels
  }

  fn sample_rate(&self) -> SampleRate {
    self.rate
  }

  fn total_duration(&self) -> Option<Duration> {
    None
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  /// Needs network: `cargo test -- --ignored`
  #[test]
  #[ignore]
  fn decodes_a_live_stream() {
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
      let result = stream("https://ice.somafm.com/groovesalad-128-mp3", 1, &tx);
      let _ = tx.send(Command::Ended(1, format!("{result:?}")));
    });
    match rx.recv_timeout(Duration::from_secs(20)) {
      Ok(Command::Ready(1, mut source)) => {
        assert_eq!(source.channels().get(), 2);
        assert!([44_100, 48_000].contains(&source.sample_rate().get()));
        let samples: Vec<f32> = source.by_ref().take(44_100).collect();
        assert!(samples.iter().any(|s| s.abs() > 0.001), "decoded audio is silent");
      }
      Ok(Command::Ended(_, e)) => panic!("stream failed: {e}"),
      _ => panic!("no audio within 20s"),
    }
  }
}
