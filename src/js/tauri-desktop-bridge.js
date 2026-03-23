import { invoke, isTauri } from '@tauri-apps/api/core';

function normalizeParts(parts) {
  if (parts.length === 1 && Array.isArray(parts[0])) {
    return parts[0].map(part => String(part));
  }

  return parts.map(part => String(part));
}

export async function setupTauriDesktopBridge() {
  if (!isTauri()) {
    return;
  }

  const desktopApi = {
    client: undefined,
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
      const code = await desktopApi.getFile(...parts);
      return (0, eval)(code);
    },
    async dialog(options) {
      return invoke('show_dialog', { options });
    },
    async openExternal(url) {
      return invoke('open_external_url', { url: String(url) });
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

  window.desktop = desktopApi;
  globalThis.desktop = desktopApi;
}
