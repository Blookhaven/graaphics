'use strict';

window.$ = window.jQuery = require('jquery');
	
const remote = require('electron').remote;
const dialog = remote.dialog;
const app = remote.app;
	
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const Client = require('ftp');//https://www.npmjs.com/package/ftp


/* * * * * * * * * * * * * * * * * * * * * * * */

const TabGroup = require("electron-tabs");
const dragula = require("dragula");
 
let tabGroup = new TabGroup({
	ready: function (tabGroup) {
		dragula([tabGroup.tabContainer], {
			direction: "horizontal"
		});
	}
});

let home = {
	title: "Vid3x",
	src: "tab.html?script=home",
	visible: true,
	active: true,
	closable: false,
	// preload: "home.js",
	// id: "home",
	// webpreferences:"nativeWindowOpen=true"
}

let proj = {
	title: "untitled project",
	src: "tab.html?script=project",
	visible: true,
	active: true,
	closable: true,
	// preload: "project.js"
}

const newTab = (args)=>{
	
	let tab = tabGroup.addTab(args)

	let webview = tab['webview'];

	// webview['preload'] = args['preload'];
	// webview['preload'] = "project.js"
	webview['preload'] = "preload.js"
};

ipcRenderer.send('loaded')
ipcRenderer.on('loaded',()=>{
	newTab(home)
	// newTab(home)
	// newTab(home)
	newTab(proj)
	// setTimeout(newTab,500,proj)
})

/* * * * * * * * * * * * * * * * * * * * * * * */



$(document).on('keydown',()=>{if((event.keyCode === 73 || event.keyCode === 74) && event.altKey && (event.metaKey || event.ctrlKey)){ipcRenderer.send('toggleDevTools')}});