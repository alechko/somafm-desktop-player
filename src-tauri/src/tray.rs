//! Tray menu. Built and handled here rather than through the JS menu API, whose
//! item callbacks never fired for the tray. Clicks are forwarded to the UI,
//! which owns the player state and sends the menu's state back with `tray_update`.

use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{
  menu::{AboutMetadata, CheckMenuItem, IsMenuItem, Menu, MenuEvent, MenuItem, PredefinedMenuItem, Submenu},
  AppHandle, Emitter, Manager, Runtime,
};

const TRAY_ID: &str = "main";
const APP_NAME: &str = "SomaFM Desktop Player";

#[derive(Deserialize, Default, Clone)]
pub struct Favorite {
  id: String,
  title: String,
}

#[derive(Deserialize, Default, Clone)]
pub struct Device {
  /// None is "System Default"
  id: Option<String>,
  name: String,
}

/// What the menu shows, sent by the UI whenever it changes
#[derive(Deserialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TrayState {
  playing: bool,
  station: Option<String>,
  favorites: Vec<Favorite>,
  devices: Vec<Device>,
  device: Option<String>,
}

/// A tray click, forwarded to the UI
#[derive(Serialize, Clone)]
#[serde(tag = "type", rename_all = "camelCase")]
enum TrayAction {
  Toggle,
  Next,
  Prev,
  PlayStation { id: String },
  SetDevice { id: Option<String> },
}

#[derive(Default)]
pub struct Tray(Mutex<TrayState>);

#[tauri::command]
pub fn tray_update<R: Runtime>(state: TrayState, app: AppHandle<R>, tray: tauri::State<Tray>) -> Result<(), String> {
  *tray.0.lock().map_err(|e| e.to_string())? = state.clone();
  rebuild(&app, &state).map_err(|e| e.to_string())
}

pub fn on_menu_event<R: Runtime>(app: &AppHandle<R>, event: MenuEvent) {
  let id = event.id().as_ref();
  let action = match id {
    "toggle" => TrayAction::Toggle,
    "next" => TrayAction::Next,
    "prev" => TrayAction::Prev,
    _ => {
      if let Some(station) = id.strip_prefix("fav:") {
        TrayAction::PlayStation { id: station.to_string() }
      } else if let Some(device) = id.strip_prefix("device:") {
        TrayAction::SetDevice { id: (!device.is_empty()).then(|| device.to_string()) }
      } else {
        return;
      }
    }
  };
  let _ = app.emit("tray-action", action);

  // macOS flips a check item's mark by itself when clicked; redraw from the real state
  // so a click can't leave several devices checked
  let state = app.state::<Tray>().0.lock().map(|s| s.clone()).unwrap_or_default();
  let _ = rebuild(app, &state);
}

fn rebuild<R: Runtime>(app: &AppHandle<R>, state: &TrayState) -> tauri::Result<()> {
  let Some(tray) = app.tray_by_id(TRAY_ID) else { return Ok(()) };
  let has_station = state.station.is_some();

  let about = PredefinedMenuItem::about(
    app,
    Some(&format!("About {APP_NAME}")),
    Some(AboutMetadata {
      name: Some(APP_NAME.into()),
      ..Default::default()
    }),
  )?;
  let toggle = MenuItem::with_id(app, "toggle", if state.playing { "Pause" } else { "Play" }, has_station, None::<&str>)?;
  let next = MenuItem::with_id(app, "next", "Next Station", has_station, None::<&str>)?;
  let prev = MenuItem::with_id(app, "prev", "Previous Station", has_station, None::<&str>)?;

  let favorite_items = state
    .favorites
    .iter()
    .map(|f| {
      let current = state.station.as_deref() == Some(f.id.as_str());
      CheckMenuItem::with_id(app, format!("fav:{}", f.id), &f.title, true, current, None::<&str>)
    })
    .collect::<tauri::Result<Vec<_>>>()?;
  let favorites = if favorite_items.is_empty() {
    let empty = MenuItem::new(app, "No favorites yet", false, None::<&str>)?;
    Submenu::with_items(app, "Favorites", true, &[&empty])?
  } else {
    Submenu::with_items(app, "Favorites", true, &as_items(&favorite_items))?
  };

  let device_items = std::iter::once(Device { id: None, name: "System Default".into() })
    .chain(state.devices.iter().cloned())
    .map(|d| {
      let checked = d.id == state.device;
      let id = format!("device:{}", d.id.as_deref().unwrap_or_default());
      CheckMenuItem::with_id(app, id, &d.name, true, checked, None::<&str>)
    })
    .collect::<tauri::Result<Vec<_>>>()?;
  let devices = Submenu::with_items(app, "Audio Output", true, &as_items(&device_items))?;

  let menu = Menu::with_items(
    app,
    &[
      &about,
      &PredefinedMenuItem::separator(app)?,
      &toggle,
      &next,
      &prev,
      &PredefinedMenuItem::separator(app)?,
      &favorites,
      &devices,
      &PredefinedMenuItem::separator(app)?,
      &PredefinedMenuItem::quit(app, None)?,
    ],
  )?;
  tray.set_menu(Some(menu))
}

fn as_items<R: Runtime>(items: &[CheckMenuItem<R>]) -> Vec<&dyn IsMenuItem<R>> {
  items.iter().map(|i| i as &dyn IsMenuItem<R>).collect()
}
