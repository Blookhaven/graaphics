'use strict';

window.$ = window.jQuery = require('jquery');
const electron = require('electron');	
const os = require('os');
const fs = require('fs');
const path = require('path');
const Client = require('ftp');
const TabGroup = require("electron-tabs");

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;
const ipcRenderer = electron.ipcRenderer;

let tabGroup = new TabGroup();

console.log(os.arch())
console.log(os.EOL.split('\\'))
console.log(os.arch())

/* * * * * * * * * * * * * * * * * * * * * * * */

const newTab = (args)=>{
	
	let tab = tabGroup.addTab(args)
	/*define the new webview*/
	let webview = tab['webview'];
	/*inject the preload script into the new webview*/
	/*the preload script is needed to inject jQuery*/
	/*after the DOM has loaded, add toggleDevTools function*/
	/*and then require the designated script*/
	webview['preload'] = "preload.js";
	/*a webview (in this case, tab contents) is NOT a new app window*/
	/*it is a ¿sandboxed? element in the renderer process (here, index.html)*/
	/*and requires preload script to allow node/electron to interact with it's contents*/
	// ipcRenderer.send('countTabs')

	tab.on('close',(tab)=>{
		countTabs();
	})
	countTabs();
};

const countTabs = ()=>{
	/*maximum of ten project tabs plus home tab - eleven total*/

	// $('.etabs-tab').css({maxWidth:`calc(${100 / $('.etabs-tab').length}% - 20px)`})
	$('.etabs-tab').css({maxWidth:`${100 / $('.etabs-tab').length}%`})

	// console.log(tabGroup.getActiveTab())
	// console.log(tabGroup.getTabs())
};

ipcRenderer.on('newTab',(event,data)=>{
	newTab(eval(data));
})

// ipcRenderer.on('countTabs',(event)=>{
// 	console.log($('.etabs-tab').length)
// })

ipcRenderer.on('lockout',(event)=>{
	$('body').addClass('pointerEventsNone');
})

ipcRenderer.on('unlock',(event)=>{
	$('body').removeClass('pointerEventsNone');
})

/*send 'loaded' event to main process to get response*/
ipcRenderer.send('loaded');
/*response from main process is needed before calling newTab funtion to correctly inject the preload script - why? maybe async stuff? I can't know everything...*/
ipcRenderer.on('loaded',(event,data)=>{
	
	window['tempDir'] = data;

	window['home'] = {
		title: "Graaphics",
		src: `tab.html?script=home&tempDir=${tempDir}`,
		visible: true,
		active: true,
		closable: false,
		tabClass: 'tabHome',
		// viewClass: 'viewHome',
	}

	window['project'] = {
		title: "untitled project 1234567890",
		src: `tab.html?script=project&tempDir=${tempDir}`,
		visible: true,
		active: true,
		closable: true,
	}

	window['quote'] = {
		title: `quote_${btoa(os.userInfo()['username'])}_${new Date().getTime()}`,
		src: `tab.html?script=quote&tempDir=${tempDir}`,
		visible: true,
		active: true,
		closable: true,
	}	

	newTab(home);/*call the newTab function passing designated script name as argument*/
})

ipcRenderer.on('loginSuccess',(event,data)=>{console.log(data)
	$('.login').off();
	$('.loginText').html(data);
})


/*apply body of css file to dynamic stylesheet tag*/
$.get('./index.css',(data)=>{
	$('#stylesheet').text(data);
},'text')


/*login*/
$('.login').off().on('click',()=>{

	let windata = {
		window: 'login',
		width: 288,
		height: 162 + 24,
		resizable: false,
		minimizable: false,
		closable: true,
		titleBarStyle: 'hidden',
		backgroundColor: "#46464c",
		data: {},
	}

	ipcRenderer.send('win',windata);
})
/*login*/

/*add keyboard functions*/
$(document).on('keydown',(event)=>{
	
	/*add toggleDevTools function*/
	if((event.keyCode === 73/*i*/ || event.keyCode === 74/*j*/) && event.altKey && (event.metaKey || event.ctrlKey)){
		ipcRenderer.send('toggleDevTools')
	}

	console.log('keyCode: ',event.keyCode);
	// // console.log('altKey: ',event.altKey);
	console.log('metaKey: ',event.metaKey);
	// // console.log('ctrlKey: ',event.ctrlKey);

	// if(
	// 	event.keyCode === 192 && event.metaKey
	// 	// (event.keyCode === 192/*~*/) && 
	// 	// (
	// 	// 	(os.platform() === 'darwin' && event.metaKey) || 
	// 	// 	(os.platform() === 'win32' && event.ctrlKey)
	// 	// )
	// ){
	// 	console.log('???')
	// 	// alert('!')
	// 	// tabGroup.getNextTab();
	// 	// console.log(tabGroup.getNextTab())
	// 	// tab.activate(tabGroup.getNextTab())
	// }
});


ipcRenderer.on('quit',(event)=>{
	/*meet some conditions?*/
	ipcRenderer.send('quit',confirm('Quit Graaphics?'));
});



// let quit = confirm('false');

// window.onbeforeunload = (e)=>{

// }

