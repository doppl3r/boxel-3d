// Modules to control application life and create native browser window
import { app, BrowserWindow, dialog, globalShortcut, ipcMain, Menu, shell } from 'electron';
import { fileURLToPath } from 'url';
import Store from 'electron-store';
import steamworks from 'steamworks.js';
import path from 'path';
import { promises as fs } from 'fs';

// Configure directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize state keeper
const store = new Store();

// Enable Steam overlay
steamworks.init(3208440);
steamworks.electronEnableSteamOverlay();

// Add event listener to preload.js (bridged to renderer)
ipcMain.handle('toggleFullScreen', toggleFullScreen);
ipcMain.handle('dialog', openDialog);
ipcMain.handle('getFile', getFile);
ipcMain.handle('getFileNames', getFileNames);
ipcMain.handle('getFilePath', getFilePath);
ipcMain.handle('loadScript', loadScript);

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

async function openDialog(event, args) {
  return await dialog.showOpenDialog(args);
}

async function loadScript(event, ...args) {
  const file = await getFile(event, ...args);
  return await mainWindow.webContents.executeJavaScript(file);
}

async function getFile(event, ...args) {
  // Note: Add "extraFiles" value to package.json to access outside app.asar archive
  const filePath = path.resolve(...args);
  const file = fs.readFile(filePath, 'utf-8');
  return file;
}

async function getFileNames(event, ...args) {
  // Note: Add "extraFiles" value to package.json to access outside app.asar archive
  const dir = path.resolve(...args);
  const fileNames = fs.readdir(dir);
  return fileNames;
}

async function getFilePath(event, args) {
  // Note: Add "extraFiles" value to package.json to access outside app.asar archive
  return path.resolve(__dirname, app.isPackaged ? '../../' : '', args);
}

function openDevTools() {
  mainWindow.webContents.openDevTools();
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

  // Automatically maximize window
  if (store.get('maximized')) mainWindow.maximize();

  // Automatically open devtools
  if (store.get('devtools')) openDevTools();

  // Show the game only after it is done loading (requires "show": false above to work properly)
  mainWindow.once('ready-to-show', function() {
    // Reset zoom before showing app
    mainWindow.webContents.setZoomFactor(1);
    mainWindow.show();

    // Add event listeners
    mainWindow.on('resized', storeWindowSize);
    mainWindow.on('moved', storeWindowPosition);
    mainWindow.on('maximize', storeWindowMaximized);
    mainWindow.on('unmaximize', storeWindowMaximized);
  });

  // Store devtools visibility
  mainWindow.webContents.on('devtools-opened', () => store.set('devtools', true))
  mainWindow.webContents.on('devtools-closed', () => store.set('devtools', false))

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