import { invoke, isTauri } from '@tauri-apps/api/core';

function normalizeParts(parts) {
  if (parts.length === 1 && Array.isArray(parts[0])) {
    return parts[0].map(part => String(part));
  }

  return parts.map(part => String(part));
}

export async function setupTauriElectronShim() {
  if (!isTauri()) {
    return;
  }

  const steamEnabled = await invoke('steam_is_enabled').catch(() => false);

  function ensureSteamEnabled() {
    if (steamEnabled !== true) {
      throw new Error('Steam integration is unavailable for this build.');
    }
  }

  const electronApi = {
    client: undefined,
    steam: {
      enabled: steamEnabled,
      workshop: {
        getSubscribedItems() {
          ensureSteamEnabled();
          return invoke('steam_workshop_get_subscribed_items');
        },
        getItems(itemIds) {
          ensureSteamEnabled();
          return invoke('steam_workshop_get_items', { itemIds });
        },
        installInfo(publishedFileId) {
          ensureSteamEnabled();
          return invoke('steam_workshop_install_info', { publishedFileId: String(publishedFileId) });
        },
        getUserItems(page, accountId, listType, itemType, sortOrder, appIds) {
          ensureSteamEnabled();
          return invoke('steam_workshop_get_user_items', {
            page,
            accountId,
            listType,
            itemType,
            sortOrder,
            appIds,
          });
        },
        createItem(appId) {
          ensureSteamEnabled();
          return invoke('steam_workshop_create_item', { appId });
        },
        getItem(itemId) {
          ensureSteamEnabled();
          return invoke('steam_workshop_get_item', { itemId: String(itemId) });
        },
        updateItem(publishedFileId, updateDetails) {
          ensureSteamEnabled();
          return invoke('steam_workshop_update_item', {
            publishedFileId: String(publishedFileId),
            updateDetails,
          });
        },
        download(publishedFileId, highPriority) {
          ensureSteamEnabled();
          return invoke('steam_workshop_download', {
            publishedFileId: String(publishedFileId),
            highPriority: Boolean(highPriority),
          });
        },
      },
      apps: {
        appOwner() {
          ensureSteamEnabled();
          return invoke('steam_apps_app_owner');
        },
      },
      utils: {
        getAppId() {
          ensureSteamEnabled();
          return invoke('steam_utils_get_app_id');
        },
      },
    },
    async getFile(...parts) {
      return invoke('get_file', { parts: normalizeParts(parts) });
    },
    async getFileNames(...parts) {
      return invoke('get_file_names', { parts: normalizeParts(parts) });
    },
    async getFilePath(relativePath) {
      return invoke('get_file_path', { relativePath: String(relativePath) });
    },
    async getFileExists(...parts) {
      return invoke('get_file_exists', { parts: normalizeParts(parts) });
    },
    async loadScript(...parts) {
      const code = await electronApi.getFile(...parts);
      return (0, eval)(code);
    },
    async dialog(options) {
      return invoke('show_dialog', { options });
    },
    async toggleFullScreen() {
      return invoke('toggle_full_screen');
    },
    async openDevTools() {
      return invoke('open_dev_tools');
    },
    async quit() {
      return invoke('quit');
    }
  };

  window.electron = electronApi;
  globalThis.electron = electronApi;
}
