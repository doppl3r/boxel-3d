// Modules to control application life and create native browser window
import { app, BrowserWindow, shell } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';

// Configure directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 640,
    height: 360,
    fullscreen: false,
    icon: './build/png/icon128.png',
    show: true,
    useContentSize: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

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