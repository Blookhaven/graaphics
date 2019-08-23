'use strict';

const electron = require('electron');
const os = require('os');
// const {app, BrowserWindow} = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const dialog = electron.dialog;

const webContents = electron.webContents;

const Menu = electron.Menu;
let template = [
  {
    label:"Application",
    submenu:[
      { label: "About Vid3x", selector: "orderFrontStandardAboutPanel:" },
      { type: "separator" },
      { label: "Quit", accelerator: "CmdOrCtrl+Q", click:()=>{app.quit()}}
    ]
  },
  {
    label:"File",
    submenu:[
      { label: "separator" },
    ]
  },
  {
    label:"Stuff",
    submenu:[
      { label: "dosomething", accelerator: "CmdOrCtrl+`", click:()=>{
        console.log('>>')
      } },
      { label: "dosomething", accelerator: "CmdOrCtrl+Alt+`", click:()=>{
        console.log('>')
      } },
    ]
  },
]
Menu.setApplicationMenu(Menu.buildFromTemplate(template));

let mainWindow;

let documents = app.getPath('documents');console.log(documents)
let userData = app.getPath('userData');console.log(userData)

let quit = false;

function createWindow () {
  
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1104,
    minWidth: 1024,
    minHeight:576,
    titleBarStyle: 'hidden',
    // titleBarStyle: 'hiddenInset',
    enableLargerThanScreen: false,
    backgroundColor: "#1a1a1d",
  })

  /*open window on secondary display - development*/
  // let displays = electron.screen.getAllDisplays()
  // let externalDisplay = displays.find((display) => {
  //   return display.bounds.x !== 0 || display.bounds.y !== 0
  // })

  // if (externalDisplay) {
  //   mainWindow = new BrowserWindow({
  //     width: 1600,
  //     height: 900,
  //     minWidth: 1024,
  //     minHeight:576,
  //     x: externalDisplay.bounds.x + 50,
  //     y: externalDisplay.bounds.y + 50,
  //     titleBarStyle: 'hidden',
  //     enableLargerThanScreen: false,
  //     backgroundColor: "#1a1a1d",
  //   })
  // }
  /*open window on secondary display - development*/
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('close',(event)=>{ //   <---- Catch close event

    if(quit === false){
      event.preventDefault()
      mainWindow.webContents.send('quit')
    }else{
      app.quit()
    }
  });

  // mainWindow.on('keydown',()=>{
  //   console.log('!!!')
  // },true)
}

app.on('ready', createWindow)

ipcMain.on('quit',(event,data)=>{
  quit = data;
  if(quit === true){
    app.quit()
  }
})

// app.on('window-all-closed', function () {
//   // if (process.platform !== 'darwin') {
//   //   app.quit()
//   // }
// })

// app.on('activate', function () {//???
//   if (mainWindow === null) {
//     createWindow()
//   }
// })

ipcMain.on('loaded',(event)=>{
  console.clear()
  console.log('loaded...')
  console.log(os.EOL);//
  console.log(os.arch());//
  console.log(os.homedir());//
  console.log(os.hostname());//
  console.log(os.platform());//
  console.log(os.release());//
  console.log(os.tmpdir());//
  console.log(os.totalmem());//
  console.log(os.userInfo());//

  console.log(`*** quit: ${quit} ***`)
  
  event.sender.send('loaded')
})

// ipcMain.on('proj',(event,message)=>{
//   console.log('proj called from ipc')
//   console.log(message)
// })

ipcMain.on('toggleDevTools',(event)=>{
    event.sender.toggleDevTools();
})


ipcMain.on('win',(event,windata)=>{

  mainWindow.webContents.send('lockout');
  // console.log(event.sender.webContents)
  console.log(`\n* * * * * ${event.sender.webContents.viewInstanceId} * * * * *\n`)
  
  windata['viewInstanceId'] = event.sender.webContents.viewInstanceId;

  // console.log(windata['sender'])
  
  let win = new BrowserWindow({
    width: windata['width'],
    height: windata['height'],
    resizable: windata['resizable'],
    titleBarStyle: windata['titleBarStyle'],
    backgroundColor: windata['backgroundColor'],
    parent:mainWindow,
  })

  // win.loadURL(`file://${__dirname}/win.html?script=${windata['window']}&params=${Buffer.from(JSON.stringify(windata['data']),'binary').toString('base64')}`);
  win.loadURL(`file://${__dirname}/win.html?script=${windata['window']}`);

  // win.on('load',()=>{
  //   console.log('LOAD')
  //   win.webContents.send('windata',windata['data']);
  // })

  win.on('blur',()=>{
    // console.log('blur')
    // win.focus();//this might not be the best idea... much loop
    // win.close();
  })

  // win.on('focus',()=>{
  //   console.log('FOCUSED')
  //   // win.webContents.send('windata',windata['data']);
  // })
  win.on('closed',()=>{
    mainWindow.webContents.send('unlock');
  })

  // ipcMain.on('winload',(event)=>{
  ipcMain.once('winload',(event)=>{
    // console.log(`windata['viewInstanceId'] : ${windata['viewInstanceId']}`)
    // console.log(windata)
    console.log('\n- - - - - - - - - -\n')
    // console.log(webContents.getAllWebContents())
    console.log(webContents.getFocusedWebContents())
    event.sender.send('windata',windata)
  })
})


ipcMain.on('newTab',(event,data)=>{
  mainWindow.webContents.send('newTab',data);
})
ipcMain.on('countTabs',(event)=>{
  event.sender.send('countTabs')
})



ipcMain.on('projectTitle',(event,data)=>{
  // console.log(event,data,'* * * * *')
  // console.log(event.sender.webContents.viewInstanceId)
  console.log(data['viewInstanceId'])
})