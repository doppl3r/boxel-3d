const { contextBridge, ipcRenderer } = require('electron');
const steamworks = require('steamworks.js');

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Renderer DOM changes go here
});

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('electron', {
  toggleFullScreen: () => ipcRenderer.invoke('toggleFullScreen'),
  workshop: async (...args) => await ipcRenderer.invoke('workshop', ...args)
});