const { contextBridge, ipcRenderer } = require('electron');

// Declare Steam variables
let steamworks;
let client;

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Renderer DOM changes go here
});

try {
  steamworks = require('steamworks.js');
  client = steamworks.init(3208440);
}
catch (error) {
  console.error(error);
}

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('electron', {
  client,
  getFile: (...path) => ipcRenderer.invoke('getFile', ...path),
  getFileNames: (...path) => ipcRenderer.invoke('getFileNames', ...path),
  getFilePath: file => ipcRenderer.invoke('getFilePath', file),
  getFileExists: (...path) => ipcRenderer.invoke('getFileExists', ...path),
  loadScript: (...path) => ipcRenderer.invoke('loadScript', ...path),
  dialog: (options) => ipcRenderer.invoke('dialog', options),
  toggleFullScreen: () => ipcRenderer.invoke('toggleFullScreen')
});