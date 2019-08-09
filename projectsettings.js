'use strict';

const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

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

let projectTitle;
let windata;

/*close the window when escape key is pressed*/
$(window).on('keydown',(e)=>{
	if(e.keyCode === 27){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})

ipcRenderer.send('winload');
ipcRenderer.on('windata',(event,data)=>{
	// console.log(data);
	windata = data;
	console.log(windata);
})

////////////////////////////////////////////////////



$('body').append(`
	<div class="titleBar">Project Settings</div>
	<div class="content"></div>
	
	<div class="settings">
		<span class="heading headTitle">Project title</span>
		<input type="text" name="projectTitle" placeholder="untitled visual explainer">
		<span class="heading headSave">Save location</span>
		<div class="saveLocation">2019-08-06 16:18:03.978 Electron Helper[4295:2454909] Couldn't set selectedTextBackgroundColor from default ()</div>
		<span class="heading headCategory">Category</span>
		<select id="selectCategory">
			<option>Editorial</option>
			<option>Commercial</option>
		</select>
		<span class="heading headStyle">Style</span>
		<select id="selectStyle">
			<optgroup label="Arvo">
				<option>Arvo - Dark</option>
				<option>Arvo - Bright</option>
			</optgroup>
			<optgroup label="Other">
				<option>Antenna - Blue</option>
				<option>Merriweather</option>
			</optgroup>
		</select>
		<span class="heading headMusic">Background music</span>
		<select id="selectMusic"></select>
	</div>


	
	
	<span class="heading headTime">Timing</span>
	<span class="heading headCopy">Copy</span>

	<textarea name="prefill" placeholder="prefill"></textarea>
`)

$('[type=text][name=projectTitle]').on('change',(event)=>{

	// title = $('[type=text][name=projectTitle]')[0]['value'];
	projectTitle = $(event.target)[0]['value'];
	console.log(projectTitle)

	$(event.target)[0].blur()

	windata['projectTitle'] = projectTitle;

	// ipcRenderer.send('projectTitle',projectTitle);
	ipcRenderer.send('projectTitle',windata);
});