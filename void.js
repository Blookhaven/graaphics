'use strict';

const electron = require('electron');
const remote = electron.remote;

$(document).ready(()=>{
	remote.BrowserWindow.getFocusedWindow().close();
})