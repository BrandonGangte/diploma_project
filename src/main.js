/**
 * @file: main.js
 *
 * @description: This is the main process file, the entry point of the
 *              application.
 *              It will handle all the startup task required for the
 *              application.
 *              Communication with renderer processes will happen through
 *              ipc.Main(in main.js) and ipc.Rendere(in renderer).
 *
 * @author: ...
 */

// All modules required for the main process.
const {app, ipcMain, BrowserWindow, Menu} = require('electron');

// for reading and storing userdata.
//const userDataStore = require('./scripts/userDataStore');

// helper modules.
const path = require('path');
const url = require('url');
const fs = require('fs');

// global reference of main window.
let mainWindow,
    appSettings = null;

/**
 * @description: create a window when called by first cheching for previous
 *               sessions and if not found load the default window.
 * @return: nothing
 * @param: none
 */
function createWindow() {
  'use strict';
  let windowState = {
    width: 1000,
      height: 600,
     // title: app.getName(),
     // fullscreen: true,
    background: '#2e2c29',
    show: false
  };

  windowState = JSON.parse(fs.readFileSync(path
                    .join(app.getPath('userData'),
                    'settings.json'), 'utf-8'))
                    .lastWindowState || windowState;
  // create the browser window.
  mainWindow = new BrowserWindow(windowState);
 //  mainWindow.toggleDevTools();
  //  mainWindow.setFullScreen(true);
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../app/views/index.html'),
    protocol: 'file:',
    slashes: true
  })); // end of loadURL.

  const template = [

    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
          {
      label: 'Quit',
      submenu: [
        {role: 'close'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More'
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // when the window has finished loading, send messages
  // to the renderer process for some startup specific task.
  mainWindow.webContents.on('did-finish-load', () => {
    // mainWindow.webContents.send('previous-session-info', previousSessionInfo);
    // TODO..
  });

  // once the application is ready to be displayed.
  mainWindow.once('ready-to-show', () => {
    // diplay the UI.
    mainWindow.show();
  });

  ipcMain.on('app-settings', (e, oAppSettings) => {
      appSettings = oAppSettings;
  });
  mainWindow.on('close', () => {
    var bounds = mainWindow.getBounds();
    var lastWindowState = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        maximized: mainWindow.isMaximized()
    };
    fs.writeFileSync(path.join(app.getPath('userData'), 'settings.json'),
    JSON.stringify({'lastWindowState': lastWindowState, 'appSettings': appSettings}), 'utf-8');
  });

  mainWindow.on('closed', () => {
    // When closed, deference the mainWindow object.
    mainWindow = null;
  });

}// end of function createWindow.

// When electron has finished initialisation and is ready to create browser
// windows, call the create window function.
app.on('ready', createWindow);

// OS X specific.
app.on('activate', () => {
  'use strict';
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// When all windows have been closed
app.on('windows-all-closed', () => {
  'use strict';
  // if on OS X, call the app.quit() method.
  // because, on OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
