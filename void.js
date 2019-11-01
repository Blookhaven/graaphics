'use strict';

const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

$(document).ready(()=>{
	ipcRenderer.send('winload');
})

ipcRenderer.on('windata',(event)=>{
	remote.BrowserWindow.getFocusedWindow().close();
})