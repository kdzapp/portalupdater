const { app, dialog, BrowserWindow, ipcMain } = require('electron')
const Store = require('electron-store');
const store = new Store();
const { spawn } = require('child_process');
const log = require('electron-log');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

require('dotenv').config()
let win

const { autoUpdater } = require("electron-updater");

autoUpdater.logger = log;

function createWindow() {

  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: 'images/icon.png'
  });

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

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

  var child = require('child_process').execFile;
  var executablePath = "portal\\PortalSpaces.exe";

  child(executablePath, function(err, data) {
      if(err){
         console.error(err);
         return;
      }

      console.log(data.toString());
  });


  //const remote = require('electron').remote;
  //var executablePath = "portal\\PortalSpaces.exe";
  //var parameters = ["--tier", tier, "--email", email];
  //
  //const portal = spawn(executablePath, parameters);
  //portal.unref();

  //let w = remote.getCurrentWindow();
  //w.close();
}

function UpdatePortal() {
  Update(win, store);
}

autoUpdater.on('checking-for-update', () => {
  log.warn("Checking for Update");
});

autoUpdater.on('error', (error) => {
  log.warn("Update ERROR");
  log.warn(error);
});

autoUpdater.on('update-not-available', (info) => {
  log.warn("No Update");
  win.webContents.send('no-update-available');
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  log.info("Update downloaded");
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
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
  autoUpdater.setFeedURL({ provider: 'github', owner: 'kdzapp', repo: 'portalupdater', token: 'c6743a4b597a1124408470bfce41189b66b90ff4' });
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
