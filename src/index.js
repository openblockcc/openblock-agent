// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

const server = require('scratchhw-link');

//electron
const electron = require('electron');

//用一个 Tray 来表示一个图标,这个图标处于正在运行的系统的通知区 ，通常被添加到一个 context menu 上.
const Menu = electron.Menu;
const Tray = electron.Tray;
//托盘对象
var appTray = null;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        icon: path.join(__dirname, './icon/ScratchLink.ico'),
        width: 400,
        height: 400,
        center: true,
        maximizable: false,
        minimizable: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
        }
    })

    mainWindow.loadFile('./src/index.html');
    mainWindow.setMenu(null)
    // mainWindow.hide();

    const trayMenuTemplate = [
        {
            label: '帮助',
            click: function () {}
        },
        {
            label: '退出',
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
