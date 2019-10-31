'use strict'

const electron = require('electron');
const os = require('os');
const fs = require('fs');

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;
const webContents = remote.getCurrentWebContents();
const shell = electron.shell;//?????
const ipcRenderer = electron.ipcRenderer;

const documents = app.getPath('documents');console.log(documents)

let slash = '/';
if(os.platform() !== 'darwin'){
  slash = '\\';
}console.log(slash)

/*close the window when escape key is pressed*/
$(window).on('keydown',(e)=>{
	// if(e.keyCode === 27 && $('.wait').hasClass('displayNone')){
	if(e.keyCode === 27){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})

ipcRenderer.send('winload');
ipcRenderer.on('windata',(event,data)=>{
	window['windata'] = data;//might not be necessaray
	console.log(windata)
})