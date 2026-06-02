export async function setupTauriDesktopBridge() {
  if (typeof globalThis !== 'undefined') {
    globalThis.isTauri =
      typeof window !== 'undefined' &&
      typeof window.__TAURI_INTERNALS__ !== 'undefined';
  }
}
