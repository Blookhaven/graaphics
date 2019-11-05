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
// ipcRenderer.send('toggleDevTools')
let slash = '/';
if(os.platform() !== 'darwin'){
	slash = '\\';
}
/*close the window when escape key is pressed*/
$(window).on('keydown',(e)=>{
	if(e.keyCode === 27){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})

ipcRenderer.send('winload');

ipcRenderer.on('windata',(event,data)=>{
	window['windata'] = data;

	window['r'] = window['devicePixelRatio'];

	if(os.platform() === 'darwin' || r === 1){

		$('body').append(`
			<main style="
				width: ${100 * r}vw;
				height: ${100 * r}vh;
				margin: ${50 * (1 - r)}vh 0 0 ${50 * (1 - r)}vw;
				transform: scale(${1 / r});">
				<div class="productionFrame" id="productionFrame">${windata['data']['html']}</div>
			</main>
		`)
		setTimeout(saveImage,2500)
	}else{
		ipcRenderer.send('setSize',r)
	}
})

ipcRenderer.on('setSize',()=>{
	$('body').append(`
		<main style="
			width: ${100 * r}vw;
			height: ${100 * r}vh;
			margin: ${50 * (1 - r)}vh 0 0 ${50 * (1 - r)}vw;
			transform: scale(${1 / r});">
			<div class="productionFrame" id="productionFrame">${windata['data']['html']}</div>
		</main>
	`)
	setTimeout(saveImage,2500)
})

const saveImage = ()=>{
	return new Promise((resolve,reject)=>{
		webContents.capturePage({
			x: 0,
			y: 0,
			width: windata['width'],
			height: windata['height']
		}).then((resolve)=>{
			fs.writeFileSync(windata['data']['filename'],resolve.toJPEG(100))
			// fs.writeFileSync(windata['data']['filename'],resolve.toJPEG(100),{flag:'wx'},(err)=>{
			// 	if (err) {
			// 		console.log("file " + windata['data']['filename'] + " already exists, testing next");
			// 		windata['data']['filename'] = windata['data']['filename'] + "0";
			// 		writeFileSync();
			// 	}else{
			// 		console.log("Succesfully written " + windata['data']['filename']);
			// 	}
			// })
			shell.showItemInFolder(windata['data']['filename'])
			remote.BrowserWindow.getFocusedWindow().close();
		}).catch((reject)=>{
			console.log(reject)
		})
	})
};
