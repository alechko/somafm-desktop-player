//! OS media controls: media keys and the system "Now Playing" widget.
//! Playback is native, so the webview's Media Session API has nothing to control.

use std::sync::Mutex;

use souvlaki::{MediaControlEvent, MediaControls, MediaMetadata, MediaPlayback, PlatformConfig};
use tauri::{AppHandle, Emitter};

/// Media controls, if the platform provided them
pub struct Media(Mutex<Option<MediaControls>>);

pub fn init(app: &AppHandle) -> Media {
  match create(app) {
    Ok(controls) => Media(Mutex::new(Some(controls))),
    Err(e) => {
      log::warn!("media controls unavailable: {e:?}");
      Media(Mutex::new(None))
    }
  }
}

fn create(app: &AppHandle) -> Result<MediaControls, souvlaki::Error> {
  let config = PlatformConfig {
    display_name: "SomaFM Desktop Player",
    dbus_name: "somafm_desktop_player",
    hwnd: window_handle(app),
  };
  let mut controls = MediaControls::new(config)?;
  let app = app.clone();
  // Forwarded to the UI, which owns the player state
  controls.attach(move |event| {
    let action = match event {
      MediaControlEvent::Play => "play",
      MediaControlEvent::Pause | MediaControlEvent::Stop => "pause",
      MediaControlEvent::Toggle => "toggle",
      MediaControlEvent::Next => "next",
      MediaControlEvent::Previous => "prev",
      _ => return,
    };
    let _ = app.emit("media-control", action);
  })?;
  Ok(controls)
}

#[cfg(target_os = "windows")]
fn window_handle(app: &AppHandle) -> Option<*mut std::ffi::c_void> {
  use tauri::Manager;
  let window = app.get_webview_window("main")?;
  window.hwnd().ok().map(|hwnd| hwnd.0 as *mut std::ffi::c_void)
}

#[cfg(not(target_os = "windows"))]
fn window_handle(_app: &AppHandle) -> Option<*mut std::ffi::c_void> {
  None
}

/// Shows the current station in the system's Now Playing controls
#[tauri::command]
pub fn media_update(
  playing: bool,
  title: Option<String>,
  artist: Option<String>,
  media: tauri::State<Media>,
) -> Result<(), String> {
  let mut controls = media.0.lock().map_err(|e| e.to_string())?;
  let Some(controls) = controls.as_mut() else { return Ok(()) };
  controls
    .set_metadata(MediaMetadata {
      title: title.as_deref(),
      artist: artist.as_deref(),
      album: Some("SomaFM"),
      ..Default::default()
    })
    .map_err(|e| format!("{e:?}"))?;
  let playback = match (playing, title.is_some()) {
    (true, _) => MediaPlayback::Playing { progress: None },
    (false, true) => MediaPlayback::Paused { progress: None },
    (false, false) => MediaPlayback::Stopped,
  };
  controls.set_playback(playback).map_err(|e| format!("{e:?}"))
}
