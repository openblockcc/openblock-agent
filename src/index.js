const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const electron = require('electron');
const ScratchHWLink = require('scratchhw-link');
const ScratchHWExtension = require('scratchhw-extension');

const Menu = electron.Menu;
const Tray = electron.Tray;
var appTray = null;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, './icon/OpenBlock-Link.ico'),
        width: 400,
        height: 400,
        center: true,
        resizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
        
    })

    mainWindow.loadFile('./src/index.html');
    mainWindow.setMenu(null)
    // mainWindow.webContents.openDevTools();
    
    const userDataPath = electron.app.getPath('userData');

    const appPath = app.getAppPath();

    let toolsPath;
    if (appPath.search(/app.asar/g) === -1) {
        toolsPath = path.join(appPath, "tools");
    } else {
        toolsPath = path.join(appPath, "../tools");
    }
    const link = new ScratchHWLink(path.join(userDataPath, "Data"), toolsPath);
    link.listen();

    let extensionsPath;
    if (appPath.search(/app.asar/g) === -1) {
        extensionsPath = path.join(appPath, "extensions");
    } else {
        extensionsPath = path.join(appPath, "../extensions");
    }
    const extension = new ScratchHWExtension(path.join(userDataPath, "Data"), extensionsPath);
    extension.listen();

    const trayMenuTemplate = [
        {
            label: 'help',
            click: function () {}
        },
        {
            label: 'exit',
            click: function () {
                appTray.destroy();
                mainWindow.destroy();
            }
        }
        // TODO: Add a button to clear cthe cache in app path.
    ];
 
    appTray = new Tray(nativeImage.createFromPath(path.join(__dirname, './icon/OpenBlock-Link.ico')));
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip('OpenBlock Link');
    appTray.setContextMenu(contextMenu);
    
    appTray.on('click',function(){
        mainWindow.show();
    })

    mainWindow.on('close', (event) => { 
        mainWindow.hide(); 
        event.preventDefault();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    })
}

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      mainWindow.show()
    }
  })
  
  app.on('ready', createWindow);
}

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
})