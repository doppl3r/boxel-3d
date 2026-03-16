use serde::{Deserialize, Serialize};
use serde_json::json;
use steamworks::{AccountId, AppIDs, AppId, Client, FileType, PublishedFileId, UGCType, UserList, UserListOrder};
use std::{
  fs,
  path::{Path, PathBuf},
  sync::{mpsc, Mutex, OnceLock},
  thread,
  time::{Duration, Instant},
};
use tauri::{AppHandle, Manager, Window};

const STEAM_APP_ID: u32 = 3208440;
const CALLBACK_TIMEOUT: Duration = Duration::from_secs(15);

static STEAM_CLIENT: OnceLock<Mutex<Option<Client>>> = OnceLock::new();

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

fn steam_client_store() -> &'static Mutex<Option<Client>> {
  STEAM_CLIENT.get_or_init(|| Mutex::new(None))
}

fn with_steam_client<T>(f: impl FnOnce(&Client) -> Result<T, String>) -> Result<T, String> {
  let store = steam_client_store();
  let mut guard = store.lock().map_err(|_| "failed to lock steam client state".to_string())?;

  if guard.is_none() {
    match Client::init_app(AppId(STEAM_APP_ID)) {
      Ok(client) => *guard = Some(client),
      Err(error) => return Err(format!("Steam init failed: {error}")),
    }
  }

  let client = guard
    .as_ref()
    .ok_or_else(|| "steam client unavailable after init".to_string())?;

  f(client)
}

fn wait_for_callback_result<T>(client: &Client, rx: mpsc::Receiver<Result<T, String>>) -> Result<T, String> {
  let start = Instant::now();

  loop {
    if let Ok(result) = rx.try_recv() {
      return result;
    }

    if start.elapsed() > CALLBACK_TIMEOUT {
      return Err("Steam callback timeout".to_string());
    }

    client.run_callbacks();
    thread::sleep(Duration::from_millis(10));
  }
}

fn published_file_id_from_str(raw: &str) -> Result<PublishedFileId, String> {
  raw.parse::<u64>()
    .map(PublishedFileId)
    .map_err(|_| format!("invalid published file id: {raw}"))
}

fn map_user_list(value: u32) -> Result<UserList, String> {
  match value {
    0 => Ok(UserList::Published),
    1 => Ok(UserList::VotedOn),
    2 => Ok(UserList::VotedUp),
    3 => Ok(UserList::VotedDown),
    4 => Err("list type 4 (WillVoteLater) is deprecated in Steam API".to_string()),
    5 => Ok(UserList::Favorited),
    6 => Ok(UserList::Subscribed),
    7 => Ok(UserList::UsedOrPlayed),
    8 => Ok(UserList::Followed),
    _ => Err(format!("unsupported user list type: {value}")),
  }
}

fn map_ugc_type(value: u32) -> Result<UGCType, String> {
  match value {
    0 => Ok(UGCType::Items),
    1 => Ok(UGCType::ItemsMtx),
    2 => Ok(UGCType::ItemsReadyToUse),
    3 => Ok(UGCType::Collections),
    4 => Ok(UGCType::Artwork),
    5 => Ok(UGCType::Videos),
    6 => Ok(UGCType::Screenshots),
    7 => Ok(UGCType::AllGuides),
    8 => Ok(UGCType::WebGuides),
    9 => Ok(UGCType::IntegratedGuides),
    10 => Ok(UGCType::UsableInGame),
    11 => Ok(UGCType::ControllerBindings),
    12 => Ok(UGCType::GameManagedItems),
    13 => Ok(UGCType::All),
    _ => Err(format!("unsupported UGC item type: {value}")),
  }
}

fn map_user_list_order(value: u32) -> Result<UserListOrder, String> {
  match value {
    0 => Ok(UserListOrder::CreationOrderAsc),
    1 => Ok(UserListOrder::CreationOrderDesc),
    2 => Ok(UserListOrder::TitleAsc),
    3 => Ok(UserListOrder::LastUpdatedDesc),
    4 => Ok(UserListOrder::SubscriptionDateDesc),
    5 => Ok(UserListOrder::VoteScoreDesc),
    6 => Ok(UserListOrder::ForModeration),
    _ => Err(format!("unsupported sort order: {value}")),
  }
}

fn map_visibility(value: i64) -> steamworks::PublishedFileVisibility {
  match value {
    1 => steamworks::PublishedFileVisibility::FriendsOnly,
    2 => steamworks::PublishedFileVisibility::Private,
    3 => steamworks::PublishedFileVisibility::Unlisted,
    _ => steamworks::PublishedFileVisibility::Public,
  }
}

fn query_result_to_json(result: steamworks::QueryResult, preview_url: Option<String>) -> serde_json::Value {
  json!({
    "publishedFileId": result.published_file_id.0.to_string(),
    "title": result.title,
    "description": result.description,
    "previewUrl": preview_url,
    "timeUpdated": result.time_updated,
    "timeCreated": result.time_created,
    "owner": result.owner.raw(),
    "url": result.url,
    "tags": result.tags,
    "score": result.score,
    "fileSize": result.file_size
  })
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
  with_steam_client(|_| Ok(true)).unwrap_or(false)
}

#[tauri::command]
fn steam_workshop_get_subscribed_items() -> Result<Vec<String>, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let items = ugc
      .subscribed_items(true)
      .into_iter()
      .map(|id| id.0.to_string())
      .collect::<Vec<_>>();
    Ok(items)
  })
}

#[tauri::command]
fn steam_workshop_get_items(item_ids: Vec<String>) -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let ids = item_ids
      .iter()
      .map(|id| published_file_id_from_str(id))
      .collect::<Result<Vec<_>, _>>()?;

    if ids.is_empty() {
      return Ok(json!({ "items": [] }));
    }

    let query = ugc
      .query_items(ids)
      .map_err(|error| format!("failed to create workshop details query: {error}"))?;

    let (tx, rx) = mpsc::channel();
    query.fetch(move |result| {
      let mapped = result
        .map_err(|error| error.to_string())
        .map(|results| {
          let items = results
            .iter()
            .enumerate()
            .filter_map(|(index, item)| {
              item.map(|value| {
                query_result_to_json(value, results.preview_url(index as u32))
              })
            })
            .collect::<Vec<_>>();
          json!({ "items": items })
        });
      let _ = tx.send(mapped);
    });

    wait_for_callback_result(client, rx)
  })
}

#[tauri::command]
fn steam_workshop_install_info(published_file_id: String) -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let id = published_file_id_from_str(&published_file_id)?;
    let info = ugc.item_install_info(id);
    Ok(match info {
      Some(value) => json!({
        "folder": value.folder,
        "sizeOnDisk": value.size_on_disk,
        "timestamp": value.timestamp
      }),
      None => serde_json::Value::Null,
    })
  })
}

#[tauri::command]
fn steam_apps_app_owner() -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let owner = client.apps().app_owner();
    Ok(json!({
      "steamId": owner.raw(),
      "accountId": owner.account_id().raw()
    }))
  })
}

#[tauri::command]
fn steam_utils_get_app_id() -> Result<u32, String> {
  with_steam_client(|client| Ok(client.utils().app_id().0))
}

#[tauri::command]
fn steam_workshop_get_user_items(
  page: u32,
  account_id: u32,
  list_type: u32,
  item_type: u32,
  sort_order: u32,
  app_ids: serde_json::Value,
) -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let user_list = map_user_list(list_type)?;
    let ugc_type = map_ugc_type(item_type)?;
    let order = map_user_list_order(sort_order)?;

    let creator = app_ids
      .get("creator")
      .and_then(|value| value.as_u64())
      .map(|value| value as u32)
      .unwrap_or(STEAM_APP_ID);
    let app_id = AppId(creator);

    let query = ugc
      .query_user(
        AccountId::from_raw(account_id),
        user_list,
        ugc_type,
        order,
        AppIDs::Both { creator: app_id, consumer: app_id },
        page,
      )
      .map_err(|error| format!("failed to create workshop user query: {error}"))?;

    let (tx, rx) = mpsc::channel();
    query.fetch(move |result| {
      let mapped = result
        .map_err(|error| error.to_string())
        .map(|results| {
          let items = results
            .iter()
            .enumerate()
            .filter_map(|(index, item)| {
              item.map(|value| {
                query_result_to_json(value, results.preview_url(index as u32))
              })
            })
            .collect::<Vec<_>>();
          json!({ "items": items })
        });
      let _ = tx.send(mapped);
    });

    wait_for_callback_result(client, rx)
  })
}

#[tauri::command]
fn steam_workshop_create_item(app_id: u32) -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let (tx, rx) = mpsc::channel();

    ugc.create_item(AppId(app_id), FileType::Community, move |result| {
      let mapped = result
        .map_err(|error| error.to_string())
        .map(|(item_id, legal)| {
          json!({
            "itemId": item_id.0.to_string(),
            "needsToAcceptAgreement": legal
          })
        });
      let _ = tx.send(mapped);
    });

    wait_for_callback_result(client, rx)
  })
}

#[tauri::command]
fn steam_workshop_get_item(item_id: String) -> Result<serde_json::Value, String> {
  steam_workshop_get_items(vec![item_id]).and_then(|value| {
    let items = value
      .get("items")
      .and_then(|v| v.as_array())
      .ok_or_else(|| "failed to parse workshop item response".to_string())?;

    Ok(items.first().cloned().unwrap_or(serde_json::Value::Null))
  })
}

#[tauri::command]
fn steam_workshop_update_item(
  published_file_id: String,
  update_details: serde_json::Value,
) -> Result<serde_json::Value, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let app_id = AppId(client.utils().app_id().0);
    let file_id = published_file_id_from_str(&published_file_id)?;

    let mut update = ugc.start_item_update(app_id, file_id);

    if let Some(title) = update_details.get("title").and_then(|v| v.as_str()) {
      update = update.title(title);
    }
    if let Some(description) = update_details.get("description").and_then(|v| v.as_str()) {
      update = update.description(description);
    }
    if let Some(preview_path) = update_details.get("previewPath").and_then(|v| v.as_str()) {
      update = update.preview_path(Path::new(preview_path));
    }
    if let Some(content_path) = update_details.get("contentPath").and_then(|v| v.as_str()) {
      update = update.content_path(Path::new(content_path));
    }
    if let Some(tags) = update_details.get("tags").and_then(|v| v.as_array()) {
      let tags = tags
        .iter()
        .filter_map(|entry| entry.as_str().map(|s| s.to_string()))
        .collect::<Vec<_>>();
      if !tags.is_empty() {
        update = update.tags(tags, true);
      }
    }
    if let Some(visibility) = update_details.get("visibility").and_then(|v| v.as_i64()) {
      update = update.visibility(map_visibility(visibility));
    }

    let change_note = update_details
      .get("changeNote")
      .and_then(|v| v.as_str())
      .map(|v| v.to_string());

    let (tx, rx) = mpsc::channel();
    let _watch = update.submit(change_note.as_deref(), move |result| {
      let mapped = result
        .map_err(|error| error.to_string())
        .map(|(item_id, legal)| {
          json!({
            "itemId": item_id.0.to_string(),
            "needsToAcceptAgreement": legal
          })
        });
      let _ = tx.send(mapped);
    });

    wait_for_callback_result(client, rx)
  })
}

#[tauri::command]
fn steam_workshop_download(published_file_id: String, high_priority: bool) -> Result<bool, String> {
  with_steam_client(|client| {
    let ugc = client.ugc();
    let file_id = published_file_id_from_str(&published_file_id)?;
    Ok(ugc.download_item(file_id, high_priority))
  })
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
