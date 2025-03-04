const { ipcRenderer } = require('electron/renderer');
const { contextBridge } = require('electron');

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Renderer DOM changes go here
});

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('electron', {
  toggleFullScreen: message => {
    // Send message to main.mjs
    ipcRenderer.send('toggleFullScreen', message);
  }
});