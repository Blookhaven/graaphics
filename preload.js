'use strict';

/*wait for the DOM to load*/
window.addEventListener('load',()=>{

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
	// console.log(query)
	/*inject jQuery into the webview after the DOM has loaded*/
	window.$ = window.jQuery = require('jquery');

	/*apply body of css file to dynamic stylesheet tag*/
	$.get(`./${query['script']}.css`,(data)=>{
		$('#stylesheet').text(data);
	},'text')

	/*require the designated script and add the toggleDevTools function - after a breif timeout to allow the css to load before building the DOM*/
	setTimeout(()=>{
		require(`./${query['script']}.js`);
		$(document).on('keydown',()=>{if((event.keyCode === 73 || event.keyCode === 74) && event.altKey && (event.metaKey || event.ctrlKey)){ipcRenderer.send('toggleDevTools')}});
	},125)
});