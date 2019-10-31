'use strict';

const electron = require('electron');
const os = require('os');console.log(os.platform() === 'darwin')
const fs = require('fs');
// const {app, BrowserWindow} = require('electron')
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;

const dialog = electron.dialog;

const webContents = electron.webContents;

/*temp*/
const temp = require('temp').track();
// const util = require('util');
// const exec = require('child_process').exec;
// temp.mkdir(`graaphics_`)
let tempDir;
/*temp*/

let asset, assetId;

let slash = '/';
if(os.platform() !== 'darwin'){
  slash = '\\';
}

/*SIMPLE SPELLCHECKER*/
// // Initialization.
// const SpellChecker = require('simple-spellchecker');
// let myDictionary = null;
 
// // Load dictionary.
// SpellChecker.getDictionary("en-US", "./node_modules/simple-spellchecker/dict", (err, result)=>{
//     if(!err) {
//         myDictionary = result;
//     }
// });
 
// // Define function for consult the dictionary.
// ipcMain.on('checkspell',(event, word)=>{
//     let res = null;
//     if(myDictionary != null && word != null) {
//         res = myDictionary.spellCheck(word);
//     }
//     event.returnValue = res;
// });
/*SIMPLE SPELLCHECKER*/

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

let dimensions = [
  // [2560,1440],
  // [2432,1368],
  // [2304,1296],
  // [2176,1224],
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
]

function createWindow () {

  let primaryDisplay = electron.screen.getPrimaryDisplay();

  /*open window on secondary display - development*//*
  let displays = electron.screen.getAllDisplays();
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  if(externalDisplay){

    let step = 0;
    let workAreaWidth = Math.floor(externalDisplay.workArea.width);
    let workAreaHeight = Math.floor(externalDisplay.workArea.height);

    for(let i in dimensions){
      if(workAreaWidth < dimensions[step][0] || workAreaHeight < dimensions[step][1]){
        console.log(dimensions[step][0],dimensions[step][1],step)
        step ++;
      }
    }

    let windowWidth = dimensions[step][0];
    let windowHeight = dimensions[step][1];

    let offsetX = Math.floor((externalDisplay.workArea.width - windowWidth) / 2)
    let offsetY = Math.floor((externalDisplay.workArea.height - (windowHeight + 24)) / 2)
    
    mainWindow = new BrowserWindow({
      width: dimensions[step][0],
      height: Math.round(dimensions[step][0] * 0.5625) + 24,
      minWidth: 1024,
      minHeight:(576 + 24),
      x: externalDisplay.bounds.x + offsetX,
      y: externalDisplay.bounds.y + offsetY,
      titleBarStyle: 'hidden',
      enableLargerThanScreen: false,
      backgroundColor: "#1a1a1d",
    })
  }
  *//*open window on secondary display - development*/

  /*open window on primary display*/
  let step = 0;
  let workAreaWidth = Math.floor(primaryDisplay.workArea.width);
  let workAreaHeight = Math.floor(primaryDisplay.workArea.height);

  for(let i in dimensions){
    if(workAreaWidth < dimensions[step][0] || workAreaHeight < dimensions[step][1]){
      console.log(dimensions[step][0],dimensions[step][1],step)
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
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(`file://${__dirname}/index.html`)
  // mainWindow.webContents.openDevTools()
  mainWindow.on('close',(event)=>{ //   <---- Catch close event

    if(quit === false){
      event.preventDefault()
      mainWindow.webContents.send('quit')
    }else{
      console.log('155')
      app.quit()
    }
  });

  // mainWindow.on('keydown',()=>{
  //   console.log('!!!')
  // },true)

  /*downloads*/
  mainWindow.webContents.session.on('will-download', (event, item, webContents)=>{
    console.log('\n* * * * * * * * * * will-download * * * * * * * * * *\n\n')
    console.log(item)
    console.log(webContents)
    let thisImagePath = tempDir + '/' + assetId + '.jpg'
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
        // mainWindow.webContents.send('successfulDownload',thisImagePath)
        currentTab.send('successfulDownload',thisImagePath)
        // currentSearchWindow.send('successfulDownload')
        // currentProjectWindow.send('successfulDownload',thisImagePath,thisTargets,asset,thisDetails)
      } else {
        console.log(`Download failed: ${state}`)
      }
    })

    console.log('\n- - - - - - - - - - will-download - - - - - - - - - -\n\n')
  })
  /*downloads*/
}

app.on('ready', createWindow)

ipcMain.on('defineAsset',function(event,data){
  console.log('\ndefineAsset\n')
  console.log(event.sender)
  console.log(data)
  asset = data;
  assetId = data.AssetId;
})

ipcMain.on('quit',(event,data)=>{
  quit = data;console.log(data)
  if(quit === true){
    console.log('170')
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
  // console.clear()
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
  console.log(os.userInfo()['username']);//

  console.log(`*** quit: ${quit} ***`)

  temp.mkdir(`graaphics_`,(err,dirPath)=>{
    if(err) throw err;
    tempDir = dirPath;
    event.sender.send('loaded',tempDir)
  })
  
  
})

// ipcMain.on('proj',(event,message)=>{
//   console.log('proj called from ipc')
//   console.log(message)
// })

ipcMain.on('toggleDevTools',(event)=>{
    event.sender.toggleDevTools();
})

let currentTab = null;

ipcMain.on('win',(event,windata)=>{

  mainWindow.webContents.send('lockout');
  // console.log(event.sender.webContents)
  console.log(`\n* * * * * ${event.sender.webContents.viewInstanceId} * * * * *\n`)
  currentTab = event.sender//.webContents.viewInstanceId;
  // console.log(event.sender.webContents.viewInstanceId != undefined)
  if(event.sender.webContents.viewInstanceId != undefined){
    windata['viewInstanceId'] = event.sender.webContents.viewInstanceId;
  }

  // console.log(windata['sender'])
  
  let win = new BrowserWindow({
    width: windata['width'],
    height: windata['height'],
    resizable: windata['resizable'],
    minimizable: windata['minimizable'],
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

  // win.loadURL(`file://${__dirname}/win.html?script=${windata['window']}&params=${Buffer.from(JSON.stringify(windata['data']),'binary').toString('base64')}`);
  win.loadURL(`file://${__dirname}/win.html?script=${windata['window']}`);
  // win.webContents.openDevTools()
  // win.on('load',()=>{
  //   console.log('LOAD')
  //   win.webContents.send('windata',windata['data']);
  // })

  // win.setSize(3000,2000)

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
  ipcMain.once('winload',(event)=>{/*why 'once'? - can't remember - assume it's with good reason... or maybe it was just to stop console logs filling up? -- nope. good reason.*/
    // console.log(`windata['viewInstanceId'] : ${windata['viewInstanceId']}`)
    // console.log(windata)
    console.log('\n- - - - - - - - - -\n')
    // console.log(webContents.getAllWebContents())
    console.log(webContents.getFocusedWebContents())
    event.sender.send('windata',windata)//might not be necessaray
  })
})


ipcMain.on('newTab',(event,data)=>{
  mainWindow.webContents.send('newTab',data);

  if(!fs.existsSync(`${documents+slash}graaphics${slash+data}`)){
    
    fs.mkdir(`${documents+slash}graaphics`,(err)=>{
      console.log(err)
      fs.mkdir(`${documents+slash}graaphics${slash+data}`,(err)=>{
        console.log(err)
      })
    })
  }
})

ipcMain.on('countTabs',(event)=>{
  event.sender.send('countTabs')
})



ipcMain.on('projectTitle',(event,data)=>{
  // console.log(event,data,'* * * * *')
  // console.log(event.sender.webContents.viewInstanceId)
  console.log(data['viewInstanceId'])
})


/*login and image search*/
let user = false;

ipcMain.on('loginSuccess',(event,data)=>{
  user = data;console.log(data)
  mainWindow.webContents.send('loginSuccess',user['ContactName']);
  event.sender.send('loginSuccess');
})

ipcMain.on('archive',(event)=>{
  event.sender.send('archive',user != false)
})
/*login and image search*/


