const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const electron = require('electron');
const OpenBlockLink = require('openblock-link');
const OpenBlockExtension = require('openblock-extension');

const fs = require('fs');
const compareVersions = require('compare-versions');
const del = require('del');

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
    
    const userDataPath = electron.app.getPath('userData');
    console.log('userDataPath: ', userDataPath);
    const dataPath = path.join(userDataPath, 'Data');

    const appPath = app.getAppPath();

    const appVersion = app.getVersion();
    console.log('Current version: ', appVersion);

    // if current version is newer then cache log, delet the data cache dir and write the
    // new version into the cache file.
    const applicationConfig = path.join(userDataPath, 'application.json');
    if (fs.existsSync(applicationConfig)) {
        const oldVersion = JSON.parse(fs.readFileSync(applicationConfig)).version;
        if (compareVersions.compare(appVersion, oldVersion, '>')) {
            if (fs.existsSync(dataPath)) {
                del.sync([dataPath], {force: true});
            }
            fs.writeFileSync(applicationConfig, JSON.stringify({version: appVersion}));
        }
    } else {
        if (fs.existsSync(dataPath)) {
            del.sync([dataPath], {force: true});
        }
        fs.writeFileSync(applicationConfig, JSON.stringify({version: appVersion}));
    }

    let toolsPath;
    if (appPath.search(/app.asar/g) === -1) {
        toolsPath = path.join(appPath, "tools");
    } else {
        toolsPath = path.join(appPath, "../tools");
    }
    const link = new OpenBlockLink(dataPath, toolsPath);
    link.listen();

    let extensionsPath;
    if (appPath.search(/app.asar/g) === -1) {
        extensionsPath = path.join(appPath, "extensions");
    } else {
        extensionsPath = path.join(appPath, "../extensions");
    }
    const extension = new OpenBlockExtension(dataPath, extensionsPath);
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