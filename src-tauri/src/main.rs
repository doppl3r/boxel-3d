use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager, Window};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DialogFilter {
  name: String,
  extensions: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct DialogOptions {
  properties: Option<Vec<String>>,
  filters: Option<Vec<DialogFilter>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DialogResult {
  canceled: bool,
  file_paths: Vec<String>,
}

fn resolve_parts(parts: Vec<String>) -> PathBuf {
  parts.into_iter().fold(PathBuf::new(), |mut path, part| {
    path.push(part);
    path
  })
}

#[tauri::command]
fn toggle_full_screen(window: Window) -> Result<(), String> {
  let is_full_screen = window.is_fullscreen().map_err(|err| err.to_string())?;
  window
    .set_fullscreen(!is_full_screen)
    .map_err(|err| err.to_string())
}

#[tauri::command]
fn open_dev_tools(app: AppHandle) -> Result<(), String> {
  #[cfg(debug_assertions)]
  {
    if let Some(window) = app.get_webview_window("main") {
      window.open_devtools();
      return Ok(());
    }

    Err("main window not found".to_string())
  }

  #[cfg(not(debug_assertions))]
  {
    let _ = app;
    Ok(())
  }
}

#[tauri::command]
fn quit(app: AppHandle) {
  app.exit(0);
}

#[tauri::command]
fn get_file(parts: Vec<String>) -> Result<String, String> {
  let file_path = resolve_parts(parts);
  fs::read_to_string(file_path).map_err(|err| err.to_string())
}

#[tauri::command]
fn get_file_names(parts: Vec<String>) -> Result<Vec<String>, String> {
  let dir = resolve_parts(parts);

  if !dir.exists() {
    return Ok(vec![]);
  }

  let entries = fs::read_dir(dir).map_err(|err| err.to_string())?;
  let mut names = Vec::new();

  for entry in entries {
    let entry = entry.map_err(|err| err.to_string())?;
    names.push(entry.file_name().to_string_lossy().to_string());
  }

  Ok(names)
}

#[tauri::command]
fn get_file_exists(parts: Vec<String>) -> bool {
  resolve_parts(parts).exists()
}

#[tauri::command]
fn get_file_path(app: AppHandle, relative_path: String) -> Result<String, String> {
  let mut path = app
    .path()
    .resource_dir()
    .or_else(|_| std::env::current_dir())
    .map_err(|err| err.to_string())?;

  path.push(relative_path);
  Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn show_dialog(options: DialogOptions) -> DialogResult {
  let mut dialog = rfd::FileDialog::new();

  if let Some(filters) = options.filters {
    for filter in filters {
      let extensions: Vec<&str> = filter.extensions.iter().map(String::as_str).collect();
      dialog = dialog.add_filter(&filter.name, &extensions);
    }
  }

  let is_multi = options
    .properties
    .unwrap_or_default()
    .iter()
    .any(|property| property == "multiSelections");

  let file_paths = if is_multi {
    dialog.pick_files().unwrap_or_default()
  } else {
    dialog.pick_file().map(|path| vec![path]).unwrap_or_default()
  };

  DialogResult {
    canceled: file_paths.is_empty(),
    file_paths: file_paths
      .iter()
      .map(|path| path.to_string_lossy().to_string())
      .collect(),
  }
}

#[tauri::command]
fn steam_is_enabled() -> bool {
  false
}

#[tauri::command]
fn steam_workshop_get_subscribed_items() -> Result<Vec<String>, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_get_items(_item_ids: Vec<String>) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_install_info(_published_file_id: String) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_apps_app_owner() -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_utils_get_app_id() -> Result<u32, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_get_user_items(
  _page: u32,
  _account_id: u32,
  _list_type: u32,
  _item_type: u32,
  _sort_order: u32,
  _app_ids: serde_json::Value,
) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_create_item(_app_id: u32) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_get_item(_item_id: String) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_update_item(
  _published_file_id: String,
  _update_details: serde_json::Value,
) -> Result<serde_json::Value, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

#[tauri::command]
fn steam_workshop_download(_published_file_id: String, _high_priority: bool) -> Result<bool, String> {
  Err("Steam workshop integration is not implemented yet".to_string())
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      toggle_full_screen,
      open_dev_tools,
      quit,
      get_file,
      get_file_names,
      get_file_exists,
      get_file_path,
      show_dialog,
      steam_is_enabled,
      steam_workshop_get_subscribed_items,
      steam_workshop_get_items,
      steam_workshop_install_info,
      steam_apps_app_owner,
      steam_utils_get_app_id,
      steam_workshop_get_user_items,
      steam_workshop_create_item,
      steam_workshop_get_item,
      steam_workshop_update_item,
      steam_workshop_download
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
