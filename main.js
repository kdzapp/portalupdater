const { app, BrowserWindow, ipcMain } = require('electron')
const updater = require('./js/update.js');
const Store = require('electron-store');
const store = new Store();
const { spawn } = require('child_process');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const { autoUpdater } = require("electron-updater");

autoUpdater.logger = require('electron-log');

function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600 })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// Launcher
function RunPortal(tier, email) {
  console.log(tier, email);
  const remote = require('electron').remote;
  var executablePath = "PortalOffice.exe";
  var parameters = ["--tier", tier, "--email", email];

  const portal = spawn(executablePath, parameters);
  portal.unref();

  let w = remote.getCurrentWindow();
  w.close();
}

autoUpdater.on('checking-for-update', () => {
  console.log("Checking for update");
})

autoUpdater.on('download-progress', (progress) => {
  console.log("download-progress");
})

autoUpdater.on('error', (error) => {
  console.log("ERROR");
})

autoUpdater.on('update-not-availabe', (info) => {
  console.log("No UPdate");
  updater.Update(win, store);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log("Update downloaded");
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    //message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function() {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
