mod media;
mod player;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .manage(player::AudioPlayer::new())
    .invoke_handler(tauri::generate_handler![
      player::player_play,
      player::player_stop,
      player::player_set_volume,
      player::player_set_device,
      player::list_output_devices,
      media::media_update,
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            // Joining a live MP3 stream mid-broadcast warns about the first frames; harmless
            .level_for("symphonia_bundle_mp3", log::LevelFilter::Error)
            .build(),
        )?;
      }
      // Needs the main window (for its handle on Windows), so it's set up here
      let media = media::init(app.handle());
      app.manage(media);
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while building tauri application");
}
