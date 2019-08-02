'use strict';

const electron = require('electron');
// const {app, BrowserWindow} = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

let mainWindow

function createWindow () {
  
  mainWindow = new BrowserWindow({width: 1920, height: 1104, titleBarStyle: 'hidden'}) 
  mainWindow.loadFile('index.html')
  // mainWindow.loadURL(`file://${__dirname}/page.html?a=a`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {//???
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('loaded',(event)=>{
  console.log('loaded')
  event.sender.send('loaded')
})

ipcMain.on('proj',(event,message)=>{
  console.log('proj called from ipc')
  console.log(message)
})

ipcMain.on('toggleDevTools',(event)=>{
    event.sender.toggleDevTools();
})

ipcMain.on('childWindow',(event,message)=>{
  console.log('\n\n* * * * * * * * * * * * * *\n\n* * * * * * * * * * * * * *\n\n* * * * * * * * * * * * * *\n\n')
  // console.log(event.sender.webContents)
  console.log(event.sender.webContents.viewInstanceId)

  let win = new BrowserWindow({
    width: 600,
    height: 800,
    parent:mainWindow,
    titleBarStyle: 'hidden'
  })

  win.loadFile('page.html')

  win.on('load',()=>{
    // mainWindow.setEnabled(false);
    console.log('LOAD')
  })

  win.on('focus',()=>{
    // mainWindow.setEnabled(false);
    console.log('FOCUSED')
  })
  win.on('closed',()=>{
    mainWindow.setEnabled(true);
    console.log('CLOSED')
  })
})


ipcMain.on('message',(event,message,target)=>{
  console.log('message sent via ipc')
  console.log(event.sender)
  console.log(message,target)
  event.sender.send('message',message);
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
