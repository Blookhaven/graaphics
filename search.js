'use strict';

const electron = require('electron');

const remote = electron.remote;

/*close the window when escape key is pressed*/
$(window).on('keydown',(e)=>{
	if(e.keyCode === 27){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})