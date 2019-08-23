'use strict';

window.$ = window.jQuery = require('jquery');
const electron = require('electron');	
const os = require('os');	

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;

const ipcRenderer = electron.ipcRenderer;

const fs = require('fs');
const path = require('path');
const Client = require('ftp');

/*SPELLCHECKER*/
// Require the electron spellchecker
const electronSpellchecker = require('electron-spellchecker');
// Retrieve required properties
const SpellCheckHandler = electronSpellchecker.SpellCheckHandler;
const ContextMenuListener = electronSpellchecker.ContextMenuListener;
const ContextMenuBuilder = electronSpellchecker.ContextMenuBuilder;
// Configure the spellcheckhandler
window.spellCheckHandler = new SpellCheckHandler();
window.spellCheckHandler.attachToInput();
// Start off as "US English, America"
// window.spellCheckHandler.switchLanguage('en-US');
// Create the builder with the configured spellhandler
let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
// Add context menu listener
let contextMenuListener = new ContextMenuListener((info) => {
	contextMenuBuilder.showPopupMenu(info);
});
/*SPELLCHECKER*/
console.log(os.arch())
console.log(os.EOL.split('\\'))
console.log(os.arch())

/* * * * * * * * * * * * * * * * * * * * * * * */

const TabGroup = require("electron-tabs");
// const dragula = require("dragula");
 
// let tabGroup = new TabGroup({
// 	// tabClass: 'tabProject',
// 	// viewClass: 'viewProject',
// 	closeButtonText: '&times;',
// 	ready: function (tabGroup) {
// 		dragula([tabGroup.tabContainer], {
// 			direction: "horizontal"
// 		});
// 	}
// });
let tabGroup = new TabGroup();

let home = {
	title: "Vid3x",
	src: "tab.html?script=home",
	visible: true,
	active: true,
	closable: false,
	tabClass: 'tabHome',
	// viewClass: 'viewHome',
}

let project = {
	title: "untitled project 1234567890",
	src: "tab.html?script=project",
	visible: true,
	active: true,
	closable: true,
	// tabClass: 'tabProject',
	// viewClass: 'viewProject',
	// closeButtonText: 's'
}

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
		// console.log(tab)
		countTabs();
	})
	countTabs();
};
const countTabs = ()=>{
	/*maximum of ten project tabs plus home tab - eleven total*/

	$('.etabs-tab').css({maxWidth:`calc(${100 / $('.etabs-tab').length}% - 20px)`})

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
	// console.log(event)
	$('body').addClass('pointerEventsNone');
})
ipcRenderer.on('unlock',(event)=>{
	// console.log(event)
	$('body').removeClass('pointerEventsNone');
})

/*send 'loaded' event to main process to get response*/
ipcRenderer.send('loaded');
/*response from main process is needed before calling*/
/*newTab funtion to correctly inject the preload script - why? maybe async stuff?*/
ipcRenderer.on('loaded',()=>{
	newTab(home);/*call the newTab function passing designated script name as argument*/
	// newTab(home);/*call the newTab function passing designated script name as argument*/
	// newTab(project);/*call the newTab function passing designated script name as argument*/
	// setTimeout(newTab,500,proj)
})












/*apply body of css file to dynamic stylesheet tag*/
$.get('./index.css',(data)=>{
	$('#stylesheet').text(data);
},'text')

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
	ipcRenderer.send('quit',confirm('Quit Vid3x?'));
});



// let quit = confirm('false');

// window.onbeforeunload = (e)=>{

// }