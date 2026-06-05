export async function setupTauriDesktopBridge() {
  if (typeof globalThis !== 'undefined') {
    const isTauriValue =
      typeof window !== 'undefined' &&
      typeof window.__TAURI_INTERNALS__ !== 'undefined';
    
    try {
      Object.defineProperty(globalThis, 'isTauri', {
        value: isTauriValue,
        writable: false,
        enumerable: true,
        configurable: true
      });
    } catch (e) {
      // Silently fail if property is already defined or cannot be set
      console.debug('Could not define isTauri property:', e);
    }
  }
}
