'use strict';
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const getQueryParams = (qs)=>{
	qs = qs.split('+').join(' ');
	let params = {},
	tokens,
	re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
};

let query = getQueryParams(document.location.search);

console.log(query)

window.addEventListener('load',()=>{
	window.$ = window.jQuery = require('jquery');
	$(document).on('keydown',()=>{if((event.keyCode === 73 || event.keyCode === 74) && event.altKey && (event.metaKey || event.ctrlKey)){ipcRenderer.send('toggleDevTools')}});
	// $.getScript(resources + '/js/export.js')
	// $.getScript(`./${query.script}.js`)

	// ipcRenderer.send('message',query['script'],null);
	// ipcRenderer.on('message',(event,message)=>{
	// 	console.log(message)
	// 	// $.getScript(`${message}.js`);
	// })
});

// require('./home.js')
require(`./${query['script']}.js`)