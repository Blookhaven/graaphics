'use strict';

const electron = require('electron');
const os = require('os');
const fs = require('fs');
const temp = require('temp').track();
// const util = require('util');//Can't remember if I'll need this for anything later...
// const exec = require('child_process').exec;//Can't remember if I'll need this for anything later...
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const webContents = electron.webContents;
const systemPreferences = electron.systemPreferences;

let mainWindow;
let documents = app.getPath('documents');
let userData = app.getPath('userData');
let quit = false;
let currentTab = null;
let user = false;

let dimensions = [
  [2048,1152],
  [1920,1080],
  [1792,1008],
  [1664,936],
  [1536,864],
  [1408,792],
  [1280,720],
  [1152,648],
  [1024,576],
  [896,504],
  [768,432],
  [640,360],
];

let tempDir;
let asset;
let assetId;
let slash = '/';

if(os.platform() !== 'darwin'){
  slash = '\\';
}else{
  systemPreferences.setUserDefault('NSDisabledDictationMenuItem', 'boolean', true);//removes 'start dictaion' from edit menu - darwin only
}

/*these functions need to be defined before adding callbacks to the menu template*/
const newDocument = ()=>{console.log(newDocument)};
const openDocument = ()=>{console.log(openDocument)};
const saveDocument = ()=>{console.log(saveDocument)};
const exportDocument = ()=>{console.log(exportDocument)};
const closeDocument = ()=>{console.log(closeDocument)};
/*these functions need to be defined before adding callbacks to the menu template*/

let template = [
  {
    label:"Application",
    submenu:[
      { label: "About Graaphics", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "CmdOrCtrl+Q", click:()=>{app.quit()}}
    ]
  },
  {
    label: "File",
    submenu: [
      { label: "New", accelerator: "CmdOrCtrl+N", click: newDocument},
      { label: "Open", accelerator: "CmdOrCtrl+O", click: openDocument},
      // { label: "Save", accelerator: "CmdOrCtrl+S", click: saveDocument},
      { type: "separator" },
      { label: "Export", accelerator: "CmdOrCtrl+E", click: exportDocument},
      { type: "separator" },
      { label: "Close", accelerator: "CmdOrCtrl+W", click: closeDocument}//,
    ]
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
      { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
      { type: "separator" },
      { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]
  }
]
Menu.setApplicationMenu(Menu.buildFromTemplate(template));

const createWindow = ()=>{

  let primaryDisplay = electron.screen.getPrimaryDisplay();
  /*open window on primary display*/
  let step = 0;
  let workAreaWidth = Math.floor(primaryDisplay.workArea.width);
  let workAreaHeight = Math.floor(primaryDisplay.workArea.height);

  for(let i in dimensions){
    if(workAreaWidth < dimensions[step][0] || workAreaHeight < dimensions[step][1]){
      // console.log(dimensions[step][0],dimensions[step][1],step)
      step ++;
    }
  }

  let windowWidth = dimensions[step][0];
  let windowHeight = dimensions[step][1];

  mainWindow = new BrowserWindow({
    width: dimensions[step][0],// 1664,
    height: Math.round(dimensions[step][0] * 0.5625) + 24,//(936 + 24),
    minWidth: 1024,
    minHeight:(576 + 24),
    titleBarStyle: 'hidden',
    enableLargerThanScreen: true,
    backgroundColor: "#1a1a1d",
    webPreferences:{
      nodeIntegration: true,
      webviewTag: true,
    },
  })
  /*open window on primary display*/
  mainWindow.removeMenu()//Linux & Windows only
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('close',(event)=>{//Catch close event
    if(quit === false){
      event.preventDefault()
      mainWindow.webContents.send('quit')
    }else{
      app.quit()
    }
  });

  /*downloads*/
  mainWindow.webContents.session.on('will-download', (event, item, webContents)=>{
    let thisImagePath = `${tempDir}/${assetId}.jpg'`;
    item.setSavePath(thisImagePath)

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused')
        } else {
          console.log(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully')
        webContents.send('successfulDownload')
        currentTab.send('successfulDownload',thisImagePath)
      } else {
        console.log(`Download failed: ${state}`)
      }
    })
  })
  /*downloads*/

  /*UPDATER*/
  autoUpdater.checkForUpdatesAndNotify();
  /*UPDATER*/  
};

ipcMain.on('defineAsset',(event,data)=>{
  asset = data;
  assetId = data.AssetId;
});

ipcMain.on('quit',(event,data)=>{
  quit = data;
  if(quit === true){
    app.quit()
  }
});

ipcMain.on('loaded',(event)=>{
  
  // console.log('loaded...')
  // console.log(os.EOL);//The operating system-specific end-of-line marker.
  // console.log(os.arch());//
  // console.log(os.homedir());//
  // console.log(os.hostname());//
  // console.log(os.platform());//
  // console.log(os.release());//
  // console.log(os.tmpdir());//
  // console.log(os.totalmem());//
  // console.log(os.userInfo());//
  // console.log(os.userInfo()['username']);//
  // console.log(`quit: ${quit}`)

  global['tabs'] = {
    total:0
  }

  temp.mkdir(`graaphics_`,(err,dirPath)=>{
    if(err) throw err;
    tempDir = dirPath;
    event.sender.send('loaded',tempDir)
  })
});

ipcMain.on('toggleDevTools',(event)=>{
    event.sender.toggleDevTools();
});

ipcMain.on('win',(event,windata)=>{

  mainWindow.webContents.send('lockout');
  currentTab = event.sender;

  if(event.sender.webContents.viewInstanceId != undefined){
    windata['viewInstanceId'] = event.sender.webContents.viewInstanceId;
  }

  let win = new BrowserWindow({
    width: windata['width'],
    height: windata['height'],
    resizable: windata['resizable'],
    minimizable: windata['minimizable'],
    fullscreen: windata['fullscreen'],
    closable: windata['closable'],
    titleBarStyle: windata['titleBarStyle'],
    backgroundColor: windata['backgroundColor'],
    opacity: windata['opacity'],
    frame: windata['frame'],
    parent:mainWindow,
    webPreferences:{
      nodeIntegration: true,
      webviewTag: true,
    },
  })

  win.loadURL(`file://${__dirname}/win.html?script=${windata['window']}`);

  win.on('blur',()=>{})
  win.on('focus',()=>{})
  
  win.on('closed',()=>{
    mainWindow.webContents.send('unlock');
  })

  ipcMain.once('winload',(event)=>{
    event.sender.send('windata',windata)
  })

  ipcMain.on('setSize',(event,data)=>{
    win.setSize(windata['width'],windata['height'])
    event.sender.send('setSize')
  })
});

ipcMain.on('unlock',(event)=>{
  mainWindow.webContents.send('unlock');
});

ipcMain.on('newTab',(event,data)=>{

  if(tabs['total'] < 6){

    if(!fs.existsSync(`${documents+slash}graaphics${slash+data}`)){
      fs.mkdir(`${documents+slash}graaphics`,(err)=>{
        console.log(err)
        fs.mkdir(`${documents+slash}graaphics${slash+data}`,(err)=>{
          console.log(err)
        })
      })
    }

    if(!tabs[data]){
      tabs[data] = 1;
    }else{
      tabs[data] += 1
    }

    mainWindow.webContents.send('newTab',data,tabs[data]);
  }else{
    mainWindow.webContents.send('maxTabs')
  }
});

ipcMain.on('countTabs',(event,data)=>{
  tabs['total'] = data;
});

ipcMain.on('initialise',(event,data)=>{
  event.sender.send('initialise',tabs[data]);
});

ipcMain.on('projectTitle',(event,data)=>{
  mainWindow.send('projectTitle',data);
});

/*login and image search*/
ipcMain.on('loginSuccess',(event,data)=>{
  user = data;
  mainWindow.webContents.send('loginSuccess',user['ContactName']);
  event.sender.send('loginSuccess');
});

ipcMain.on('archive',(event)=>{
  event.sender.send('archive',user != false)
});
/*login and image search*/

/*UPDATER*/
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const sendStatusToWindow = (text,disp)=>{
  log.info(text);
  mainWindow.webContents.send('message',text,disp);
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for updates...',false);
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.',false);
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('No updates available.',3000);
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow(`Error in auto-updater. ${err}`,5000);
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  let display_msg = `Downloading update: ${Math.floor(progressObj.percent)}%`
  sendStatusToWindow(log_message,display_msg);
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded.',3000);
});
/*UPDATER*/

app.on('ready', createWindow);







/*bushfire*/
ipcMain.on('firepic',(event,data)=>{
  currentTab.send('firepic',data)
})

/*covid19*/
ipcMain.on('covid19pic',(event,data)=>{
  currentTab.send('covid19pic',data)
})

ipcMain.on('nodesent',(event,data)=>{
  // webContents.send('successfulDownload')

  webContents.getAllWebContents().forEach(wc => {
    wc.send('nodesent')
  })
})