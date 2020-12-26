const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const electron = require('electron');
const ScratchHWLink = require('scratchhw-link');

const Menu = electron.Menu;
const Tray = electron.Tray;
var appTray = null;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, './icon/ScratchLink.ico'),
        width: 400,
        height: 400,
        center: true,
        // resizable: false,
        fullscreenable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
        
    })

    mainWindow.loadFile('./src/index.html');
    mainWindow.setMenu(null)
    // mainWindow.webContents.openDevTools();
    
    const userDataPath = (electron.app || electron.remote.app).getPath(
        'userData'
    );

    const appPath = app.getAppPath();

    let toolsPath;
    if (appPath.search(/app.asar/g) === -1) {
        toolsPath = path.join(appPath, "tools");
    } else {
        toolsPath = path.join(appPath, "../tools");
    }
    const link = new ScratchHWLink(userDataPath, toolsPath);
    link.listen();

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
    ];
 
    appTray = new Tray(path.join(__dirname, './icon/ScratchLink.ico'));
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    appTray.setToolTip('Scratch-HW Link');
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