import { contextBridge, ipcRenderer } from 'electron';

// All of the Node.js APIs are available in the preload process.
window.addEventListener('DOMContentLoaded', function () {
  // Request fullscreen
  //document.body.requestFullscreen();
});

// Predefine message for renderer to request
contextBridge.exposeInMainWorld('api', {
  sendMessageToMain: message => {
    ipcRenderer.send('messageFromRenderer', message);
  }
});