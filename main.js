// Modules to control application life and create native browser window
import { app, BrowserWindow, globalShortcut, ipcMain, Menu, shell } from 'electron';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import steamworks from 'steamworks.js';
import path from 'path';

// Configure directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize state keeper
const store = new Store();

// Initialize main window outside creation
let mainWindow;

// Remove hidden menu behaviors (ex: zoom)
Menu.setApplicationMenu(Menu.buildFromTemplate([]));

function storeWindowSize() {
  const [width, height] = mainWindow.getSize();
  store.set({ width, height });
}

function storeWindowPosition() {
  const [x, y] = mainWindow.getPosition();
  store.set({ x, y });
}

function storeWindowMaximized() {
  const maximized = mainWindow.isMaximized();
  store.set({ maximized });
}

function toggleFullScreen() {
  mainWindow.setFullScreen(!store.get('fullscreen'));
  store.set('fullscreen', !store.get('fullscreen'));
}

function openDevTools() {
  mainWindow.webContents.openDevTools();
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

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    autoHideMenuBar: false,
    height: store.get('height') || 360,
    icon: './build/png/icon128.png',
    show: true,
    title: 'Boxel 3D',
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.mjs')
    },
    width: store.get('width') || 640,
    x: store.get('x'),
    y: store.get('y')
  });

  // Set fullscreen state from store
  mainWindow.setFullScreen(store.get('fullscreen'));

  // Maximize/fullscreen window if already set
  if (store.get('maximized')) mainWindow.maximize();

  // Show the game only after it is done loading (requires "show": false above to work properly)
  mainWindow.once('ready-to-show', function() {
    // Reset zoom before showing app
    mainWindow.webContents.setZoomFactor(1);
    mainWindow.show();

    // Add event listener to preload.js (bridged to renderer)
    ipcMain.on('toggleFullScreen', toggleFullScreen);

    // Add event listeners
    mainWindow.on('resized', storeWindowSize);
    mainWindow.on('moved', storeWindowPosition);
    mainWindow.on('maximize', storeWindowMaximized);
    mainWindow.on('unmaximize', storeWindowMaximized);
  });

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

// This method will be called when Electron has finished initialization and is ready to create browser windows. Some APIs can only be used after this event occurs.
app.whenReady().then(function () {
  // Add keyboard shortcuts
  globalShortcut.register('F11', toggleFullScreen);
  globalShortcut.register('Ctrl+Shift+I', openDevTools);
  globalShortcut.register('Escape', function() {
    mainWindow.setFullScreen(false);
    store.set('fullscreen', false);
  });

  // Create window
  createWindow();

  // On macOS it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
});

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process code. You can also put them in separate files and require them here.
steamworks.electronEnableSteamOverlay();