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

  const electronApi = {
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
