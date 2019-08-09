'use strict';

const electron = require('electron');
const fs = require('fs');
const path = require('path');

const Client = require('ftp');//https://www.npmjs.com/package/ftp

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;
const shell = electron.shell;//?????
const ipcRenderer = electron.ipcRenderer;

// ipcRenderer.send('toggleDevTools')


$('body').append(`
	<div class="btn">
	btn
	</div>
`)

$('.btn').unbind().on('click',()=>{
	
	// let windata = {
	// 	window: 'projectsettings',
	// 	width: 1024,
	// 	height: 600,
	// 	resizable: false,
	// 	titleBarStyle: 'hidden',
	// 	backgroundColor: "#1a1a1d",
		
	// 	data:{
	// 		string: 'hello world example string',
	// 		num1: 400,
	// 		num2: 3,
	// 		otherstring: 'this is another string',
	// 	}
	// }

	let windata = {
		window: 'projectsettings',
		width: 1024,
		height: 600,
		resizable: false,
		titleBarStyle: 'hidden',
		backgroundColor: "#1a1a1d",
	}

	// ipcRenderer.send('win',windata);

	ipcRenderer.send('newTab','project')
})
// $('.btn').on('click',()=>{
// 	// console.log(this)
// 	ipcRenderer.send('childWindow','search');
// 	// confirm('yes?')
// })


// const authenticate = ()=>{
// 	FTPClient = $('[name=FTPClient]').val();
// 	FTPUser = $('[name=FTPUser]').val();
// 	FTPPass = $('[name=FTPPass]').val();
// 	authToken();
// };


