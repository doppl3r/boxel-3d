// Modules to control application life and create native browser window
import { app, BrowserWindow, shell } from 'electron';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import steamworks from 'steamworks.js';
import path from 'path';

// Configure directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Initialize state keeper
  const store = new Store();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: store.get('width') || 640,
    height: store.get('height') || 360,
    x: store.get('x'),
    y: store.get('y'),
    maximized: true,
    title: 'Boxel 3D',
    fullscreen: false,
    icon: './build/png/icon128.png',
    show: true,
    useContentSize: true,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  function storeWindow() {
    const [width, height] = mainWindow.getSize();
    const [x, y] = mainWindow.getPosition();
    store.set({ width, height, x, y });
  } 

  mainWindow.on('resized', storeWindow);
  mainWindow.on('maximize', storeWindow);
  mainWindow.on('unmaximize', storeWindow);
  mainWindow.on('moved', storeWindow);

  // Show the game only after it is done loading (requires "show": false above to work properly)
  mainWindow.once('ready-to-show', function() { mainWindow.show(); });

  // Allow game to send users to default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Set localStorage for app platforms
  mainWindow.webContents.executeJavaScript('localStorage.setItem("setting-timestamp", ' + (new Date().getTime()) + ');');

  // Load the index.html of the app
  mainWindow.loadFile('./build/index.html', { query: { "fullscreen": true }});
}

function loadMods(file = '/Charlieee1/Boxel-3d-Mods/main/Boxel 3d Modding API.user.js') {
  // TEST: Load mods from URL
  const url = 'https://raw.githubusercontent.com';
  file = '/Charlieee1/Boxel-3d-Mods/main/Boxel 3d Modding API.user.js';
  fetch(url + file)
    .then(response => response.text())
    .then(code => {
      // Execute code
      mainWindow.webContents.executeJavaScript(code);
    });
}

// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(function () {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process code. You can also put them in separate files and require them here.
steamworks.electronEnableSteamOverlay();