const { contextBridge, ipcRenderer } = require('electron');
const steamworks = require('steamworks.js');

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Renderer DOM changes go here
});

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('electron', {
  steamworks,
  toggleFullScreen: message => {
    // Send message to main.mjs
    ipcRenderer.send('toggleFullScreen', message);
  }
});