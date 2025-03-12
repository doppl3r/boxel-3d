const { contextBridge, ipcRenderer } = require('electron');
const steamworks = require('steamworks.js');
const client = steamworks.init(3208440);

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Renderer DOM changes go here
});

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('electron', {
  client,
  getFilePath: file => ipcRenderer.invoke('getFilePath', file),
  dialog: (options) => ipcRenderer.invoke('dialog', options),
  toggleFullScreen: () => ipcRenderer.invoke('toggleFullScreen')
});