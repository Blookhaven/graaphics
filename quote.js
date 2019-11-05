'use strict'

const electron = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');

const Client = require('ftp');//https://www.npmjs.com/package/ftp

// const domtoimage = require('dom-to-image');
// const html2canvas = require('html2canvas');

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;
const webContents = remote.getCurrentWebContents();
const shell = electron.shell;//?????
const ipcRenderer = electron.ipcRenderer;

// ipcRenderer.send('toggleDevTools')
// const temp = require('temp').track();
// const util = require('util');
// const exec = require('child_process').exec;

// var spelling = require('./'),
//     dictionary = require('./dictionaries/en_US.js');

// var dict = new spelling(dictionary);

// console.log(dict.lookup('yes'));

/*SIMPLE SPELLCHECKER*/
// Get web frame.
const webFrame = require('electron').webFrame;
 
// webFrame.setSpellCheckProvider("en-GB", false, {
//     spellCheck: (text)=>{
//         var res = ipcRenderer.sendSync('checkspell', text);
//         return res != null? res : true;
//     }
// });
/*SIMPLE SPELLCHECKER*/

/*SPELLCHECKER*/
// // Require the electron spellchecker
// const electronSpellchecker = require('electron-spellchecker');
// // Retrieve required properties
// const SpellCheckHandler = electronSpellchecker.SpellCheckHandler;
// const ContextMenuListener = electronSpellchecker.ContextMenuListener;
// const ContextMenuBuilder = electronSpellchecker.ContextMenuBuilder;
// // Configure the spellcheckhandler
// window.spellCheckHandler = new SpellCheckHandler();
// window.spellCheckHandler.attachToInput();
// // Start off as "US English, America"
// // window.spellCheckHandler.switchLanguage('en-US');
// // Create the builder with the configured spellhandler
// let contextMenuBuilder = new ContextMenuBuilder(window.spellCheckHandler);
// // Add context menu listener
// let contextMenuListener = new ContextMenuListener((info) => {
// 	contextMenuBuilder.showPopupMenu(info);
// });
/*SPELLCHECKER*/

const documents = app.getPath('documents');console.log(documents)

let slash = '/';
if(os.platform() !== 'darwin'){
  slash = '\\';
}console.log(slash)

/*build the DOM*/
$('body').append(`
	<main>

		<div class="controls panelLeft textControls">

			<div class="textInputs">
				<input type="text" name="title" placeholder="untitled">
				<textarea name="string" placeholder="Quote body"></textarea>
				<input type="text" name="source" placeholder="Source">
				<input type="text" name="exposition" placeholder="Exposition">
			</div>

			<div class="rangeGroup">
				<div>Text frame width<span><label for="textWidth" id="textWidthValue">576</label>px</span></div>
				<input type="range" name="textWidth" list="textWidth" min="432" max="1296" value="576">
				<datalist id="textWidth">
					<option value="432"></option>
					<option value="576"></option>
					<option value="864"></option>
					<option value="1152"></option>
					<option value="1296"></option>
				</datalist>
			</div>

			<div class="controls textButtons">

				<div class="textPositions">
					<input type="radio" name="textPosition" class="top left" checked="true">
					<input type="radio" name="textPosition" class="top centre">
					<input type="radio" name="textPosition" class="top right">
					<input type="radio" name="textPosition" class="middle left">
					<input type="radio" name="textPosition" class="middle centre">
					<input type="radio" name="textPosition" class="middle right">
					<input type="radio" name="textPosition" class="bottom left">
					<input type="radio" name="textPosition" class="bottom centre">
					<input type="radio" name="textPosition" class="bottom right">
				</div>

				<div class="textCheckBoxes">
					<div><input type="checkbox" name="highlighted" disabled="true"><label for="highlighted">Highlight</label></div>
					<div><input type="checkbox" name="quotemarks" checked="true"><label for="quotemarks">Quote marks</label></div>
					<div><input type="checkbox" name="hyphens"><label for="hyphens">Hyphenate</label></div>
				</div>

				<div class="textCheckBoxes">
					<label for="fontSize">Font Size</label>
					<input type="number" name="fontSize" min="10" value="50">
				</div>
			</div>

			<div class="controls textButtons">

				<select class="styleSelect" title="Style">
					<option value="" disabled="true">Style</option>
					<option value="positive" selected="true">Positive</option>
					<option value="negative">Negative</option>
				</select>

				<select class="ratioSelect" id="ratioSelect" title="Aspect Ratio">
					<option value="" disabled="true">Aspect Ratio</option>
					<option value="0.5625" selected="true">16:9</option>
					<option value="0.75">4:3</option>
				</select>

				<select class="watermarkSelect" title="Watermark">
					<option value="" disabled="true">Watermark</option>
					<option value="none">None</option>
					<option value="aap" selected="true">AAP</option>
				</select>

				<button id="saveButton" class="saveButton" title="Save Image"></button>
			</div>
		</div>

		<div class="workArea">
			
			<div class="boundingBox layer_0 pointerEventsAll" id="work_0"></div>
			<div class="boundingBox layer_1" id="work_1"></div>
			<div class="boundingBox layer_2" id="work_2"></div>
			<div class="boundingBox layer_3" id="work_3"></div>
			<div class="boundingBox layer_4" id="work_4"></div>
			
			<div class="textFrame watermarked aap positive top left">
				<div class="textContainer">
					<div class="textBox string"></div>
					<div class="textBox accreditation">
						<div class="source"></div>
						<div class="exposition"></div>
					</div>
				</div>
				<div class="watermark aap bottom right"></div>
			</div>
		</div>

		<div class="controls panelRight imageControls">

			<div class="layersPanel">
				<div class="layersTab" id="layer_4"><div class="grabber"></div><div class="tabThumb"><div class="boundingBox layer_4"></div></div><span>Layer 5</span><button class="archive"></button><button class="local"></button><button class="trash"></button></div>
				<div class="layersTab" id="layer_3"><div class="grabber"></div><div class="tabThumb"><div class="boundingBox layer_3"></div></div><span>Layer 4</span><button class="archive"></button><button class="local"></button><button class="trash"></button></div>
				<div class="layersTab" id="layer_2"><div class="grabber"></div><div class="tabThumb"><div class="boundingBox layer_2"></div></div><span>Layer 3</span><button class="archive"></button><button class="local"></button><button class="trash"></button></div>
				<div class="layersTab" id="layer_1"><div class="grabber"></div><div class="tabThumb"><div class="boundingBox layer_1"></div></div><span>Layer 2</span><button class="archive"></button><button class="local"></button><button class="trash"></button></div>
				<div class="layersTab active" id="layer_0"><div class="grabber"></div><div class="tabThumb"><div class="boundingBox layer_0"></div></div><span>Layer 1</span><button class="archive"></button><button class="local"></button><button class="trash"></button></div>
			</div>

			<div class="rangeGroup">
				<div>Zoom<span><label for="zoom" id="zoomValue">0</label>%</span></div>
				<input type="range" name="zoom" list="zoom" disabled="true">
				<datalist id="zoom"></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Opacity<span><label for="opacity" id="opacityValue">100</label>%</span></div>
				<input type="range" name="opacity" value="100" step="1" list="opacity" disabled="true">
				<datalist id="opacity"><option value="0"></option><option value="25"></option><option value="50"></option><option value="75"></option><option value="100"></option></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Blur<span><label for="blur" id="blurValue">0</label>px</span></div>
				<input type="range" name="blur" max="10" value="0" step="0.1" list="blur" disabled="true">
				<datalist id="blur"><option value="0"></option><option value="10"></option></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Brightness<span><label for="brightness" id="brightnessValue">100</label>%</span></div>
				<input type="range" name="brightness" max="200" value="100" step="1" list="brightness" disabled="true">
				<datalist id="brightness"><option value="0"></option><option value="50"></option><option value="100"></option><option value="150"></option><option value="200"></option></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Contrast<span><label for="contrast" id="contrastValue">100</label>%</span></div>
				<input type="range" name="contrast" max="200" value="100" step="1" list="contrast" disabled="true">
				<datalist id="contrast"><option value="0"></option><option value="50"></option><option value="100"></option><option value="150"></option><option value="200"></option></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Hue rotate<span><label for="hueRotate" id="hueRotateValue">0</label>&#176;</span></div>
				<input type="range" name="hueRotate" max="360" value="0" step="1" list="hueRotate" disabled="true">
				<datalist id="hueRotate">
					<option value="0"></option>
					<option value="90"></option>
					<option value="180"></option>
					<option value="270"></option>
					<option value="360"></option>
				</datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Invert<span><label for="invert" id="invertValue">0</label>%</span></div>
				<input type="range" name="invert" value="0" step="1" list="invert" disabled="true">
				<datalist id="invert">
					<option value="0"></option>
					<option value="25"></option>
					<option value="50"></option>
					<option value="75"></option>
					<option value="100"></option>
				</datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Saturation<span><label for="saturate" id="saturateValue">100</label>%</span></div>
				<input type="range" name="saturate" max="200" value="100" step="1" list="saturate" disabled="true">
				<datalist id="saturate"><option value="0"></option><option value="50"></option><option value="100"></option><option value="150"></option><option value="200"></option></datalist>
			</div>
			
			<div class="rangeGroup">
				<div>Sepia<span><label for="sepia" id="sepiaValue">0</label>%</span></div>
				<input type="range" name="sepia" value="0" step="1" list="sepia" disabled="true">
				<datalist id="sepia"><option value="0"></option><option value="25"></option><option value="50"></option><option value="75"></option><option value="100"></option></datalist>
			</div>

			<!--<div class="rangeGroup">
				<div>Rotation<span><label for="rotation" id="rotationValue">0</label>&#176;</span></div>
				<input type="range" name="rotation" max="270" value="0" step="90" list="rotation" disabled="true">
				<datalist id="rotation"><option value="0"></option><option value="90"></option><option value="180"></option><option value="270"></option></datalist>
			</div>-->
		</div>
	</main>

	<!-- * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * -->

	<div class="productionFrame" id="productionFrame">
		
		<div class="boundingBox layer_0" id="production_0"></div>
		<div class="boundingBox layer_1" id="production_1"></div>
		<div class="boundingBox layer_2" id="production_2"></div>
		<div class="boundingBox layer_3" id="production_3"></div>
		<div class="boundingBox layer_4" id="production_4"></div>
		
		<div class="textFrame watermarked aap positive top left">
			<div class="textContainer">
				<div class="textBox string"></div>
				<div class="textBox accreditation">
					<div class="source"></div>
					<div class="exposition"></div>
				</div>
			</div>
			<div class="watermark aap bottom right"></div>
		</div>
	</div>
`);
/*build the DOM*/

/*general use functions*/
const inRange = (x,min,max)=>{
	return x >= min && x <= max;
};

const difference = (a,b)=>{
	return Math.abs(a - b);
};

const sortNumber = (a,b)=>{
	return a - b;
};

const decimalise = (value,places)=>{
	let multiply = Number(`100e${places}`);//by 100 to use value as a percentage
	let divide = Number(`1e${places}`);//shift the decimal point back
	let number = Math.round(value * multiply) / divide;//do things
	let increment = 1 / divide;//for the value of the "step" property on range sliders
	return [number,increment];
};
/*general use functions*/

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

const initialise = (num)=>{

	window['query'] = getQueryParams(document.location.search);
	window['tempDir'] = query['tempDir'];
	window['title'] = `quote ${num}`;
	window['initTitle'] = title;
	window['windata'] = null;

	window['productionWidth'] = 1920;
	window['productionRatio'] = Number($('#ratioSelect').val());
	window['productionHeight']= productionWidth * productionRatio;

	window['centreX'] = productionWidth / 2;
	window['centreY'] = productionHeight / 2;

	window['project'] = {
		history:[
			{
				title: title,
				ratio: $('#ratioSelect').val(),
				theme: `positive`,//`negative`*/
				textFramePosition: `top left`,
				textFrameWidth: `${decimalise(1/3,10)[0]}%`,
				fontSize: 50,
				quoteMarks: true,
				mainCopy: ``,
				attribution: ``,
				exposition: ``,
				highlights: [],
				watermark: null,
				images: [],
			},
		]
	}

	window['Downloads'] = {};//store image IDs as keys with path as value and check against this object to prevent multiple downloads of the same file

	window['History'] = project.history;
	window['Current'] = History[History.length - 1];

	/////////////////////////////////////////////////////

	window['dec'] = 10;//the number of decimal places

	window['images'] = [
		{identifier:null},
		{identifier:null},
		{identifier:null},
		{identifier:null},
		{identifier:null},
	];
	window['currentImage'] = {};
	window['imageFrame'] = null;

	window['textProperties'] = {};
	window['tester'] = [];//to do with caret position and highlights
	window['prevStringLength'] = 0;
	window['selectedRange'] = [];
	window['ranges'] = [];
			
	window['linebreaks'] = [];

	/* * * * * * * */
	$('.workArea').css({'height':$('.workArea').width() * productionRatio});
	$('.productionFrame, .textFrame').css({'height':$('.productionFrame').width() * productionRatio});

	// console.log($('.workArea').width());
	// console.log($('.productionFrame').width());
	$('[name=title]').prop('placeholder',initTitle)
	/* * * * * * * */

	window['activeImage'] = 0;
	/*layer tabs*/
	window['layerOrder'] = []

	window['chosenFontSize'] = Number($('input[name=fontSize]').val());

	for(let i = 0; i < $('.layersTab').length; i++){
		layerOrder[i] = [$('.layersTab')[i].offsetTop,$('.layersTab')[i].id]
	}

	$('.layersTab').eq($('.layersTab').length - 1).addClass('active')

	$('.layersTab').on('click',(e)=>{
		
		activeImage = Number(($(e.target)[0]['id']).replace('layer_',''));
		imageFrame = `.${images[activeImage]['identifier']}`;
		
		if(!$(e.target).hasClass('active')){
			resetImageSliders(false);
		}

		$('.layersTab').removeClass('active')
		$(e.target).addClass('active')

		$('.boundingBox').removeClass('pointerEventsAll')
		$(`#work_${activeImage}`).addClass('pointerEventsAll')

		$('.draggable').off().on('mousedown',imageBindings);
		$(document).off('mouseup mousemove');
	})

	ipcRenderer.on('archive',(event,user)=>{

		if(user){
			windata = {
				window: 'archive',
				width: 960,
				height: $(window).height() - 72,
				resizable: false,
				minimizable: false,
				fullscreen: false,
				closable: true,
				titleBarStyle: 'hidden',
				backgroundColor: "#46464c",
				opacity: 1,
				frame: os.platform() === 'darwin',
				data: user,
			}
		}else{
			windata = {
				window: 'login',
				width: 288,
				height: 162 + 24,
				resizable: false,
				minimizable: false,
				fullscreen: false,
				closable: true,
				titleBarStyle: 'hidden',
				backgroundColor: "#46464c",
				opacity: 1,
				frame: os.platform() === 'darwin',
				data: null,
			}
		}

		ipcRenderer.send('win',windata);
	})

	$('button').on('click',(e)=>{
		window['loadThis'] = e.target.classList.value !== 'saveButton';
		console.log(e.target.classList.value,activeImage)
		switch(true){

			case e.target.classList.value === 'archive':
			ipcRenderer.send('archive');
			break;

			case e.target.classList.value === 'local':

			dialog.showOpenDialog({
				properties: ['openFile'],
				filters:[{name: 'Images',extensions:['jpg','jpeg','png','pdf','gif']}],
			}).then(result => {
				let file = tempDir.concat(result.filePaths[0].substring(result.filePaths[0].lastIndexOf(slash)))
				console.log(file)
				
				// if(os.platform() === 'darwin'){
				// 	file = tempDir.concat(result.filePaths[0].substring(result.filePaths[0].lastIndexOf('/')))
				// }else{//windows filepaths use backslash
				// 	file = tempDir.concat(result.filePaths[0].substring(result.filePaths[0].lastIndexOf('\\')))
				// }

				fs.copyFile(result.filePaths[0],file,(err)=>{
					if(err) throw err;
					loadImage(file);
				});
			}).catch(err => {
				console.log(err)
			})

			break;

			case e.target.classList.value === 'saveButton':
			// console.log(images)
			// console.log(textProperties)
			saveImage();


			break;

			case images[activeImage]['identifier'] === null:
			break;//break if there is no active image so that the trash button doesn't error. handle all other events first.

			case e.target.classList.value === 'trash':
			$(`.${images[activeImage]['identifier']}`).remove();
			images[activeImage] = {identifier:null};
			break;
		}
		return false;
	})

	$('.grabber').off().on('click mousedown mouseup',tabBindings);
	/*layer tabs*/
	// $('body').removeClass('displayNone')
	/*void window - temporary fix for input focus inconsistency*/
	ipcRenderer.send('win',{
		window: 'void',
		width: 0,
		height: 0,
		resizable: false,
		minimizable: false,
		fullscreen: false,
		closable: true,
		titleBarStyle: 'hidden',
		backgroundColor: "#46464c",
		opacity: 0,
		frame: os.platform() === 'darwin',
		data: null,
	});
	/*void window - temporary fix for input focus inconsistency*/
};

/*layer tabs*/
const getIndex = (e)=>{
	return[...e.parentNode.children].indexOf(e);
};

const tabBindings = (e)=>{

	switch(e.type){

		case 'mouseup':

		if($('.marginBottom').length > 0){
			$('.marginBottom').after($(`#${tabInit.id}`));
		}else{
			$('.layersPanel').prepend($(`#${tabInit.id}`));
		}

		for(let i in layerOrder){/*sort out the bounding box stacking order here*/
			$('.workArea').prepend($(`#${$('.layersTab')[i]['id'].replace('layer','work')}`))
			$('.productionFrame').prepend($(`#${$('.layersTab')[i]['id'].replace('layer','production')}`))
		}

		$('.layersPanel, .layersTab').removeClass('displayNone marginBottom padTop animate');
		$('.tabGhost').remove();
				
		$(document).off('mouseup mousemove');
				
		break;

		case 'mousedown':
		tabGhost(e);
		break;
	}
};

const tabGhost = (e)=>{

	let x = $(e.target).parent()[0];

	$('.layersPanel').append(`<div class="tabGhost ${x.classList.value}">${x.innerHTML}</div>`)
	$('.tabGhost').css('top',x.offsetTop)

	window['tabInit'] = {
		panelHeight: parseInt($(x).parent().css('height')),
		tabHeight: $(x).height(),
		top: x.offsetTop,
		y: e.clientY,
		index: getIndex(x),
		id: x.id,
	};

	if(tabInit.index > 0){
		$('.layersTab').eq(tabInit.index - 1).addClass('marginBottom')
	}else{
		$('.layersPanel').addClass('padTop')
	}

	$(x).addClass('displayNone')

	$(document).off('mouseup mousemove').on({'mouseup': tabBindings,'mousemove': moveTab});
};

const moveTab = (e)=>{

	let newY = tabInit.top + (e.clientY - tabInit.y);

	setTimeout(()=>{
		$('.layersPanel, .layersTab').addClass('animate');
	},125);

	switch(true){
		case newY <= 0: newY = 0; break;
		case newY >= tabInit.panelHeight - tabInit.tabHeight: newY = tabInit.panelHeight - tabInit.tabHeight; break;
	}

	switch(newY > tabInit.top){
				
		case true:
		loop: for(let i = layerOrder.length - 1; i > 0; i--){//down
			switch(true){
				case newY > layerOrder[i][0] - $('.layersTab').height() / 2 && tabInit.index != Number(i):
				$('.layersPanel').removeClass('padTop');
				$('.layersTab').removeClass('marginBottom');
				$('.layersTab').eq(i).addClass('marginBottom');
				break loop;
			}
		}
		break;

		case false:
		loop: for(let i = layerOrder.length - 1; i >= 0; i--){//up??
			switch(true){
				case newY > layerOrder[i][0] + $('.layersTab').height() / 2 && tabInit.index != Number(i):
				$('.layersPanel').removeClass('padTop');
				$('.layersTab').removeClass('marginBottom');
				$('.layersTab').eq(i).addClass('marginBottom');
				break loop;

				case newY < layerOrder[0][0] + $('.layersTab').height() / 2:
				$('.layersTab').removeClass('marginBottom');
				$('.layersPanel').addClass('padTop');
				break loop;
			}
		}
		break;
	}

	$('.tabGhost').css('top',newY);
};
/*layer tabs*/

const updateImage = (e)=>{

	switch(true){
		case e != undefined:
		switch(true){
			case e.target.name === 'zoom':
			images[activeImage]['zoom'] = Number(e.target.value);
			break;

			case e.target.name === 'rotation':

			break;

			// // case e.target.classList.value === 'ratioSelect':
			// case e.target.id === 'ratioSelect':
			// productionRatio = e.target.value;	
			// $('.workArea').css({'height':$('.workArea').width() * productionRatio});
			// $('.productionFrame, .textFrame').css({'height':$('.productionFrame').width() * productionRatio});
			// break;

			case e.target.type === 'range' || e.target.type === 'number':
			// images[activeImage][e.target.name] = Number(e.target.value);
			console.log(e.target.value);
			break;
		}
		break;

		default: console.log('updated');
	}

	let filter = $(`${imageFrame} img`).css('filter');
			
	if(filter != 'none'){
		filter = filter.split(' ');
		filter.splice(0,1,`blur(${Number(filter[0].substring(5,filter[0].length - 3)) / images[activeImage].scale}px)`);
		filter = filter.join(' ');
	}

	images[activeImage]['filter'] = filter;
	images[activeImage]['marginTop'] = parseInt($(imageFrame).css('margin-top')) / images[activeImage].scale;
	images[activeImage]['marginLeft'] = parseInt($(imageFrame).css('margin-left')) / images[activeImage].scale;

	images[activeImage]['top'] = parseInt($(imageFrame).css('top')) / images[activeImage].scale;
	images[activeImage]['left'] = parseInt($(imageFrame).css('left')) / images[activeImage].scale;

	images[activeImage]['zoom'] = $('input[name=zoom]').val();
	images[activeImage]['opacity'] = $('input[name=opacity]').val();
	images[activeImage]['blur'] = $('input[name=blur]').val();
	images[activeImage]['brightness'] = $('input[name=brightness]').val();
	images[activeImage]['contrast'] = $('input[name=contrast]').val();
	images[activeImage]['hueRotate'] = $('input[name=hueRotate]').val();
	images[activeImage]['invert'] = $('input[name=invert]').val();
	images[activeImage]['saturate'] = $('input[name=saturate]').val();
	images[activeImage]['sepia'] = $('input[name=sepia]').val();
	
	// images[activeImage]['rotation'] = $('input[name=rotation]').val();

	$(`.productionFrame .boundingBox ${imageFrame}`).css({
		width: images[activeImage].width * images[activeImage].zoom * 0.01,
		height: images[activeImage].width * images[activeImage].ratio * images[activeImage].zoom * 0.01,
		top: images[activeImage].top,
		left: images[activeImage].left,
		marginTop: images[activeImage].marginTop,
		marginLeft: images[activeImage].marginLeft,
		// filter: images[activeImage].filter,
		// transform: `rotate(${images[activeImage].rotation}deg)`,
	})

	// $(`.productionFrame .boundingBox ${imageFrame} img`).css({
	// 	filter: images[activeImage].filter,
	// 	transform: `rotate(${images[activeImage].rotation}deg)`,
	// })
};

const resetImageSliders = (overwrite)=>{

	$('#zoom option').remove();//remove datalist options for slider refresh

	switch(true){

		case images[activeImage]['identifier'] === null || overwrite:

		$('input[name=zoom]').prop('value',0);
		$('input[name=opacity]').prop('value',100);
		$('input[name=blur]').prop('value',0);
		$('input[name=brightness]').prop('value',100);
		$('input[name=contrast]').prop('value',100);
		$('input[name=hueRotate]').prop('value',0);
		$('input[name=invert]').prop('value',0);
		$('input[name=saturate]').prop('value',100);
		$('input[name=sepia]').prop('value',0);

		$('.imageControls input[type=range]').prop('disabled',true);

		$('#zoomValue').html(0);
		$('#opacityValue').html(100);
		$('#blurValue').html(0);
		$('#brightnessValue').html(100);
		$('#contrastValue').html(100);
		$('#hueRotateValue').html(0);
		$('#invertValue').html(0);
		$('#saturateValue').html(100);
		$('#sepiaValue').html(0);

		break;

		default:

		for(let i in images[activeImage]['zoomList']){//add values as datalist options to place stops on the slider
			$('#zoom').append(`<option value="${decimalise((images[activeImage]['zoomList'][i] / images[activeImage]['width']),dec)[0]}"></option>`)
		}

		$('input[type=range][name=zoom]').prop({//apply the array of accepted values to the zoom range slider
			'min': decimalise((images[activeImage]['zoomList'][0] / images[activeImage]['width']),dec)[0],
			'max': decimalise((images[activeImage]['zoomList'][Number(images[activeImage]['zoomList'].length) - 1] / images[activeImage]['width']),dec)[0],
			'step': decimalise(1,dec)[1],
			'value': images[activeImage]['zoom']
		})

		$('input[name=opacity]').prop('value',images[activeImage]['opacity']);
		$('input[name=blur]').prop('value',images[activeImage]['blur']);
		$('input[name=brightness]').prop('value',images[activeImage]['brightness']);
		$('input[name=contrast]').prop('value',images[activeImage]['contrast']);
		$('input[name=hueRotate]').prop('value',images[activeImage]['hueRotate']);
		$('input[name=invert]').prop('value',images[activeImage]['invert']);
		$('input[name=saturate]').prop('value',images[activeImage]['saturate']);
		$('input[name=sepia]').prop('value',images[activeImage]['sepia']);

		$('.imageControls input[type=range]').prop('disabled',false);

		$('#zoomValue').html(Math.round(images[activeImage]['zoom']));
		$('#opacityValue').html(Math.round(images[activeImage]['opacity']));
		$('#blurValue').html(Math.round(images[activeImage]['blur']));
		$('#brightnessValue').html(Math.round(images[activeImage]['brightness']));
		$('#contrastValue').html(Math.round(images[activeImage]['contrast']));
		$('#hueRotateValue').html(Math.round(images[activeImage]['hueRotate']));
		$('#invertValue').html(Math.round(images[activeImage]['invert']));
		$('#saturateValue').html(Math.round(images[activeImage]['saturate']));
		$('#sepiaValue').html(Math.round(images[activeImage]['sepia']));
	}
};

const loadImage = (image)=>{//this is for LOADING A NEW IMAGE - not switching focus between existing ones...
	console.log(loadImage)
	resetImageSliders(true);

	let viewScale = $('.boundingBox').width() / productionWidth;
	let viewWidth = productionWidth * viewScale;
	let viewHeight= viewWidth * $('#selectRatio').val();
	let timeStamp = new Date().getTime();

	images[activeImage]={identifier:timeStamp,}
	imageFrame = `.${images[activeImage]['identifier']}`;console.log(images[activeImage])//this'll have to be sorted out properly...

	$(`.boundingBox.${$('.active')[0]['id']}`).html(`
		<div class="imageFrame ${timeStamp}">
			<img class="imageActive" src="${image}">
			<div class="draggable"></div>
		</div>
	`)

	$('.workArea .boundingBox .imageActive').on('load',(e)=>{
		getScaleValues(e.target.width,e.target.height);
		// History[History.length] = History.slice(History.length - 1)[0];
		currentImage['width'] = e.target.width;
		currentImage['height'] = e.target.height;
	})

	$('.draggable').on('mousedown',imageBindings)
};

const getScaleValues = (imageWidth,imageHeight)=>{//this function needs to be called every time a new / different image loads / takes focus

	let imageRatio = imageHeight / imageWidth;
	let zoomList;

	switch(true){
		case imageRatio > productionRatio && imageWidth < productionWidth && imageHeight < productionHeight:
		zoomList = [imageWidth,(productionWidth * imageRatio),productionWidth,];
		break;

		case imageRatio > productionRatio && imageWidth < productionWidth && imageHeight === productionHeight:
		case imageRatio === productionRatio && imageWidth < productionWidth:
		zoomList = [imageWidth,productionWidth,];
		break;
				
		case imageRatio > productionRatio && imageWidth < productionWidth && imageHeight > productionHeight:
		zoomList = [(productionHeight / imageRatio),imageWidth,productionWidth,];
		break;

		case imageRatio > productionRatio && imageWidth === productionWidth:
		zoomList = [(productionHeight / imageRatio),imageWidth,];
		break;

		case imageRatio > productionRatio && imageWidth > productionWidth:
		zoomList = [(productionHeight / imageRatio),productionWidth,imageWidth,];
		break;

		case imageRatio < productionRatio && imageWidth < productionWidth:
		zoomList = [imageWidth,productionWidth,(productionHeight / imageRatio),];
		break;

		case imageRatio < productionRatio && imageWidth === productionWidth:
		zoomList = [imageWidth,(productionHeight / imageRatio),];
		break;

		case imageRatio < productionRatio && imageWidth > productionWidth && imageHeight < productionHeight:
		zoomList = [productionWidth,imageWidth,(productionHeight / imageRatio),];
		break;

		case imageRatio < productionRatio && imageWidth > productionWidth && imageHeight === productionHeight:
		case imageRatio === productionRatio && imageWidth < productionWidth:
		zoomList = [productionWidth,imageWidth,];
		break;

		case imageRatio < productionRatio && imageWidth > productionWidth && imageHeight > productionHeight:
		zoomList = [productionWidth,(productionHeight / imageRatio),imageWidth,];
		break;

		default: false;
	};
	applyScaleValues(imageWidth,imageRatio,zoomList)
};

const applyScaleValues = (imageWidth,imageRatio,zoomList)=>{

	$('#zoom option').remove();//remove datalist options for slider refresh
	$('.imageControls input[type=range]').prop('disabled',false);

	images[activeImage]['width'] = imageWidth;
	images[activeImage]['ratio'] = imageRatio;
	images[activeImage]['top'] = productionHeight / 2;
	images[activeImage]['left'] = productionWidth / 2;
	images[activeImage]['scale'] = $('.workArea').width() / productionWidth;
	images[activeImage]['zoomList'] = zoomList;

	if(zoomList){

		$('input[type=range][name=zoom]').prop({//apply the array of accepted values to the zoom range slider
			'min': decimalise((zoomList[0] / imageWidth),dec)[0],
			'max': decimalise((zoomList[Number(zoomList.length) - 1] / imageWidth),dec)[0],
			'value': decimalise((zoomList[Number(zoomList.length) - 2] / imageWidth),dec)[0],
			'disabled': false,
			'step': decimalise(1,dec)[1]
		})

		for(let i in zoomList){//add values as datalist options to place stops on the slider
			$('#zoom').append(`<option value="${decimalise((zoomList[i] / imageWidth),dec)[0]}"></option>`)
		}
		
		images[activeImage]['zoom'] = decimalise((zoomList[Number(zoomList.length) - 2] / imageWidth),dec)[0];
		// images[activeImage]['min'] = decimalise((zoomList[0] / imageWidth),dec)[0];
		// images[activeImage]['max'] = decimalise((zoomList[Number(zoomList.length) - 1] / imageWidth),dec)[0];
		// images[activeImage]['step'] = decimalise(1,dec)[1];
	}else{
		images[activeImage]['zoom'] = 100;
		$('input[type=range][name=zoom]').prop('disabled',true);
	}

	$('#zoomValue').html(Math.round(images[activeImage].zoom));//display the value

	applyZoomValues(imageWidth,imageRatio,images[activeImage].zoom)
	updateImage();
};

const applyZoomValues = (imageWidth,imageRatio,zoomValue)=>{

	let scale = images[activeImage].scale;// $('.workArea').width() / productionWidth;

	$(`.workArea .boundingBox ${imageFrame}`).css({

		width: Math.round(imageWidth * scale * zoomValue * 0.01),
		// margin: `-${imageWidth * scale * zoomValue * 0.01 * imageRatio / 2}px 0 0 -${imageWidth * scale * zoomValue * 0.01 / 2}px`,
		marginTop: `-${imageWidth * scale * zoomValue * 0.01 * imageRatio / 2}px`,
		marginLeft: `-${imageWidth * scale * zoomValue * 0.01 / 2}px`,

		top:  constrainToBounds(
			images[activeImage].left * scale,
			images[activeImage].top * scale,
			Math.round(imageWidth * scale * zoomValue * 0.01),
			imageWidth * scale * zoomValue * 0.01 * imageRatio,
		)[1],
		left: constrainToBounds(
			images[activeImage].left * scale,
			images[activeImage].top * scale,
			Math.round(imageWidth * scale * zoomValue * 0.01),
			imageWidth * scale * zoomValue * 0.01 * imageRatio,
		)[0],
	})

	$(imageFrame).find('img').css({width: '100%'});
};

const imageBindings = (e)=>{

	switch(e.type){
		case 'mouseup':
		case 'mouseout':
		case 'blur': 
		$('.draggable').off().on('mousedown mouseup blur',imageBindings);
		$(document).off('mouseup mousemove');
		if(parseInt($(imageFrame).css('left'))!= imageInitialPosition.left || parseInt($(imageFrame).css('top')) != imageInitialPosition.top){
			updateImage();
		}
		break;

		case 'mousedown': 
		window['imageInitialPosition'] = {
			width: parseInt($(e.target).parent().css('width')),
			height: parseInt($(e.target).parent().css('height')),
			left: parseInt($(e.target).parent().css('left')),
			top: parseInt($(e.target).parent().css('top')),
			x: e.clientX,
			y: e.clientY,
		};

		$(document).off('mouseup mousemove').on({'mouseup': imageBindings,'mousemove': moveImage});
		break;
	}
};

const moveImage = (e)=>{
	let newX = constrainToBounds(
		imageInitialPosition.left + (e.clientX - imageInitialPosition.x),
		imageInitialPosition.top + (e.clientY - imageInitialPosition.y),
		imageInitialPosition.width,
		imageInitialPosition.height
	)[0];
	let newY = constrainToBounds(
		imageInitialPosition.left + (e.clientX - imageInitialPosition.x),
		imageInitialPosition.top + (e.clientY - imageInitialPosition.y),
		imageInitialPosition.width,
		imageInitialPosition.height
	)[1];

	switch(true){//for restricting movement to horizontal, vertical or diagonal

		case !e.shiftKey:break;//if the shift key is not pressed, break out of the switch
				
		case difference(newX,imageInitialPosition.left) * 0.5 > difference(newY,imageInitialPosition.top)://horizontal distance by half is greater than total vertical disstance
		newY = imageInitialPosition.top;//snap to horizontal axis
		break;

		case difference(newY,imageInitialPosition.top) * 0.5 > difference(newX,imageInitialPosition.left)://vertical distance by half is greater than total horizontal disstance
		newX = imageInitialPosition.left;//snap to vertical axis
		break;

		case newX > imageInitialPosition.left && newY < imageInitialPosition.top://moving up and right
		case newX < imageInitialPosition.left && newY > imageInitialPosition.top://moving down and left
		newY = constrainToBounds(
			newX,
			imageInitialPosition.top - (e.clientX - imageInitialPosition.x) * productionRatio,
			imageInitialPosition.width,
			imageInitialPosition.height
		)[1];//snap to diagonal axis bottom left to top right
		break;

		case newX < imageInitialPosition.left && newY < imageInitialPosition.top://moving up and left
		case newX > imageInitialPosition.left && newY > imageInitialPosition.top://moving down and right
		newY = constrainToBounds(
			newX,
			imageInitialPosition.top + (e.clientX - imageInitialPosition.x) * productionRatio,
			imageInitialPosition.width,
			imageInitialPosition.height
		)[1];//snap to diagonal axis top left to bottom right
		break;
	}

	switch(true){
		case 
		$('input[type=checkbox][name=snapping]').prop('checked') &&//snapping is enabled
		inRange(newX,$('.workArea').width() / 2 - 10,$('.workArea').width() / 2 + 10) &&//position is within 20px of the horizontal centre
		inRange(newY,$('.workArea').height() / 2 - 10,$('.workArea').height() / 2 + 10)://position is within 20px of the vertical centre
		$(`.workArea .boundingBox ${imageFrame}`).css({top:$('.workArea').height() / 2,left:$('.workArea').width() / 2});//snap to centre
		break;

		default: $(`.workArea .boundingBox ${imageFrame}`).css({top:newY,left:newX});//move to new position without snapping 
	}			
};

const constrainToBounds = (x,y,w,h)=>{

	let boundW = $('.workArea').width();
	let boundH = $('.workArea').height();

	let constrainedX;
	let constrainedY;

	switch(true){
		case w === boundW:
		case w > boundW && x > w / 2: constrainedX = w / 2; break;
		case w > boundW && x < boundW - w / 2: constrainedX = boundW - w / 2; break;
		case w < boundW && x > boundW - w / 2: constrainedX = boundW - w / 2; break;
		case w < boundW && x < w / 2: constrainedX = w / 2; break;
		default: constrainedX = x;
	}
	switch(true){
		case h === boundH:
		case h > boundH && y > h / 2: constrainedY = h / 2; break;
		case h > boundH && y < boundH - h / 2: constrainedY = boundH - h / 2; break;
		case h < boundH && y > boundH - h / 2: constrainedY = boundH - h / 2; break;
		case h < boundH && y < h / 2: constrainedY = h / 2; break;
		default: constrainedY = y;
	}

	return [constrainedX,constrainedY];
};


$('input[type=range][name=zoom]').on('keydown',(e)=>{
			
	let factor = 1;

	if(e.shiftKey){
		factor = 10;
	}

	switch(e.keyCode){
		case 38:
		case 39:
		e.target.value = Math.round(e.target.value) + factor;
		break;
		case 37:
		case 40:
		e.target.value = Math.floor(e.target.value) - factor;
		break;
	}

	for(let i = 0; i < $('#zoom option').length; i++){
		if(difference(e.target.value,Number($('#zoom option')[i]['value'])) < 0.5){
			$('input[type=range][name=zoom]').prop('value',Number($('#zoom option')[i]['value']))
		}
	}
});

$('.imageControls input[type=range]').on('input',(e)=>{

	if(e.target.name === 'zoom'){
		applyZoomValues(
			images[activeImage].width,
			images[activeImage].ratio,
			Number(e.target.value),
		)
	}

	if(e.target.name === 'rotation'){

	}

	let blur = $('input[name=blur]').val() * images[activeImage].scale;//this will need to be scaled correctly...
	let brightness = $('input[name=brightness]').val() / 100;
	let contrast = $('input[name=contrast]').val() / 100;
	let hueRotate = $('input[name=hueRotate]').val();
	let invert = $('input[name=invert]').val() / 100;
	let opacity = $('input[name=opacity]').val() / 100;
	let saturate = $('input[name=saturate]').val() / 100;
	let sepia = $('input[name=sepia]').val() / 100;

	let rotation = $('input[name=rotation]').val();

	$(`#${e.target.name}Value`).html(Math.round(e.target.value))
	// $(`.workArea .boundingBox ${imageFrame} img`).css({'filter': `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) hue-rotate(${hueRotate}deg) invert(${invert}) opacity(${opacity}) saturate(${saturate}) sepia(${sepia})`})
	$(`.boundingBox ${imageFrame} img`).css({'filter': `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) hue-rotate(${hueRotate}deg) invert(${invert}) opacity(${opacity}) saturate(${saturate}) sepia(${sepia})`})
	
	$(`.boundingBox ${imageFrame}`).css({'transform':`rotate(${rotation}deg)`})
});

$('.imageControls input').on('change',updateImage);

$('#ratioSelect').on('change',(e)=>{
	productionRatio = e.target.value;	
	$('.workArea').css({'height':$('.workArea').width() * productionRatio});
	$('.productionFrame, .textFrame').css({'height':$('.productionFrame').width() * productionRatio});
	// console.log($('.workArea .imageFrame').length)
});

/********************************************************************************************************************************************************************************************/

const textHandler = (e)=>{

	if(e.type === 'change'){

		if(e.target.name === 'title'){
			if(e.target.value.length > 0){
				title = e.target.value;
			}else{
				title = initTitle;
			}
			ipcRenderer.send('projectTitle',title)
		}
		// console.log('* * * * * * * * * * *\n\n* * * CHANGED! * * *\n\n* * * * * * * * * * *\n\n')
		// console.log(e.target.type)
		// console.log(e.target.classList.value)
		console.log(textProperties)
	}

	// textProperties = {
	// 	textFramePosition: `top left`,
	// 	textFrameWidth: `${decimalise(1/3,10)[0]}%`,
	// 	fontSize: 50,
	// 	quoteMarks: true,
	// 	mainCopy: ``,
	// 	attribution: ``,
	// 	exposition: ``,
	// 	highlights: [],
	// }

	while($('.textContainer').height() > 970){

		let fontSize = parseInt($('.textFrame').css('font-size')) - 1;
		$('.textControls input[type=number][name=fontSize]').prop('value',fontSize)
		$('.textFrame').css('font-size',`${fontSize}px`);
	}
			
	switch(true){
		case e.target.type === 'textarea' && e.target.name === 'string':
		processString(e);
		// textProperties[`${e.target.name}`] = e.target.value;
		break;

		// case e.target.type === 'text':
		case e.target.name === 'source' || e.target.name === 'exposition':
		$(`.${e.target.name}`).html(e.target.value)
		textProperties[`${e.target.name}`] = e.target.value;
		console.log(e.target.value);

		break;

		case e.target.type === 'radio':
		$('.textFrame').removeClass('top middle bottom left centre right').addClass(e.target.classList.value);
		textProperties['textPosition'] = e.target.classList.value;
		break;
				
		case e.target.type === 'number':
		$('.textFrame').css('font-size',`${e.target.value}px`);
		textProperties['fontSize'] = e.target.value;
		break;

		case e.target.type === 'range':
		$('.textContainer').css('width',Number(e.target.value))
		textProperties['textContainerWidth'] = e.target.value;
		$(`#${e.target.name}Value`).html(Math.round(e.target.value))
		break;

		case e.target.classList.value === 'styleSelect':
		for(let i = 1; i < e.target.options.length; i++){
			$('.textFrame').removeClass(e.target.options[i].value);
		}
		$('.textFrame').addClass(e.target.value);
		break;

		// case e.type === 'change' && e.target.type === 'select-one' && e.target.classList.value === 'ratioSelect':
		// productionRatio = e.target.value;	
		// $('.workArea').css({'height':$('.workArea').width() * productionRatio});
		// $('.productionFrame, .textFrame').css({'height':$('.productionFrame').width() * productionRatio});
		// break;

		case e.target.classList.value === 'watermarkSelect' || e.target.classList.value === 'watermarkNone':
		for(let i = 1; i < e.target.options.length; i++){
			$('.watermark').removeClass(e.target.options[i].value);
		}
		if(e.target.value === 'none'){
			$('.textFrame').removeClass('watermarked');
			$(e.target).removeClass('watermarkSelect').addClass('watermarkNone');
		}else{
			$('.textFrame').addClass('watermarked');
			$('.watermark').addClass(e.target.value);
			$(e.target).removeClass('watermarkNone').addClass('watermarkSelect');
		}
		break;

		// case e.target.type === 'checkbox' && e.target.name === 'hyphens' && e.target.checked:
		// $('.textBox.string').css('hyphens','auto');

		// case e.target.type === 'checkbox' && e.target.name === 'hyphens' && !e.target.checked:
		// $('.textBox.string').css('hyphens','unset');
	}

	if(textProperties['source']  === '' && textProperties['exposition'] === ''){
		$('.textBox.string').addClass('unaccredited');
		$('.textBox.accreditation').addClass('displayNone');
	}else{
		$('.textBox.string').removeClass('unaccredited');
		$('.textBox.accreditation').removeClass('displayNone');
	}

	if(textProperties['string']  === ''){
		$('.textBox.string').addClass('displayNone');
		$('.textBox.accreditation').addClass('unaccredited');
	}else{
		$('.textBox.string').removeClass('displayNone');
		$('.textBox.accreditation').removeClass('unaccredited');
	}
};

$('.textControls textarea, .textControls input').on('input mouseup change',textHandler);
$('.styleSelect, .watermarkSelect').on('change',textHandler);

$('.textControls input[type=checkbox][name=quotemarks]').on('change',(e)=>{

	if(e.target.checked){
		$('.quotemark').removeClass('displayNone');
	}else{
		$('.quotemark').addClass('displayNone');
	}
})

$('.textControls input[type=checkbox][name=hyphens]').on('change',(e)=>{

	if(e.target.checked){
		$('.textBox.string').css('hyphens','auto');
	}else{
		$('.textBox.string').css('hyphens','unset');
	}
})

$('.textControls input[type=number][name=fontSize]').on('focus',(e)=>{
	$(e.target).select();
})

// $('.textControls textarea').on('blur',()=>{
// 	$('input[name=highlighted]').prop('checked',false)
// 	// $('input[name=highlighted]').prop({'checked':false,'disabled':true})
// })

const getCaretPosition = (node)=>{
	if(node.selectionStart){
		return node.selectionStart;
	}else if(!document.selection){
		return 0;
	}

	let c = "\\001";
	let sel = document.selection.createRange();
	let txt = sel.text;
	let dul = sel.duplicate();
	let len = 0;
	try{
		dul.moveToElementText(node);
	}
	catch(e){
		return 0;
	}
	sel.text = txt + c;
	len = (dul.text.indexOf(c));
	sel.moveStart('character',-1);
	sel.text = "";
	return len;
};

const processString = (e)=>{
			
	textProperties['string'] = e.target.value;			
	selectedRange = [getCaretPosition(e.target),(Number(getCaretPosition(e.target)) + Number(window.getSelection().toString().length))]
	ranges = [];//reset the ranges array

	for(let i in tester){
			
		for(let j = selectedRange[0]; j < selectedRange[1] + 1; j++){//loop through the character positions in the current selection
			if(inRange(j,...tester[i])){//check if the iterated character position falls within one of the highlight ranges
				ranges.push(Number(i))//record the highlight range iterator
				break;
			}
		}
	}

	if(ranges.length > 0){
		$('input[name=highlighted]').prop({'checked':true,'disabled':false});
	}else{
		$('input[name=highlighted]').prop('checked',false);
					
		if(difference(...selectedRange) > 0){
			$('input[name=highlighted]').prop('disabled',false);
		}else{
			$('input[name=highlighted]').prop('disabled',true);
		}
	}

	if(e.type === 'input'){

		for(let i in tester){//loop through the array of highlight ranges

			let stringDifference = textProperties['string'].length - prevStringLength;

			switch(true){
				case
				stringDifference > 0 &&//the string has become longer
				(selectedRange[0] <= tester[i][0] || selectedRange[0] - 1 == tester[i][0])://the caret position falls before OR level with the opening of a highlight range
				tester[i][0] += stringDifference;//move the opening position the difference in characters
				tester[i][1] += stringDifference;//move the closing position the difference in characters
				break;
				/* * * * */
				case
				stringDifference < 0 &&//the string has become shorter
				selectedRange[0] < tester[i][0]://the caret position falls before the opening of a highlight range
				tester[i][0] += stringDifference;//move the opening position the difference in characters
				tester[i][1] += stringDifference;//move the closing position the difference in characters
				break;
				/* * * * */
				case
				stringDifference > 0 &&// the string has become longer
				selectedRange[0] > tester[i][0] &&
				// selectedRange[1] <= tester[i][1] + 1://the caret position falls after the opening of a highlight range AND before OR level with the closing
				selectedRange[1] <= tester[i][1]://the caret position falls after the opening of a highlight range AND before the closing
				tester[i][1] += stringDifference;//move only the closing position the difference in characters
				break;
				/* * * * */
				case
				stringDifference < 0 &&//the string has become shorter
				selectedRange[0] > tester[i][0] &&
				selectedRange[1] < tester[i][1]://the caret position falls after the opening of a highlight range AND before the closing
				tester[i][1] += stringDifference;//move only the closing position the difference in characters
				break;
				/* * * * */
				case
				stringDifference < 0 &&//the string has become shorter
				difference(tester[i][0],tester[i][1]) > 1 &&//only one character is highlighted
				selectedRange[0] == tester[i][0]://the first character in the highlighted range gets deleted
				tester[i][1] += stringDifference;
				break;
				/* * * * */
				case
				stringDifference < 0 &&//the string has become shorter
				difference(tester[i][0],tester[i][1]) == 1 &&//only one character is highlighted
				selectedRange[0] <= tester[i][0]://the first character in the highlighted range gets deleted
				tester.splice(i,1);// remove this range from the array
				break;
			}
		}

		prevStringLength = textProperties['string'].length;

		linebreaks = [];//reset the linebreaks array

		for(let i = 0; i < e.target.value.length; i++){
			if(e.target.value[i] == '\n'){
				linebreaks.push(i)
			}
		}
		renderString();
	}
};

const renderString = ()=>{
			
	let str = textProperties.string;
	let arr = [];
	let tags = {};

	for(let i in tester){
		arr.push(...tester[i]);
	}

	arr.sort(sortNumber);

	for(let i in arr){
		if(i % 2 == 0){
			tags[arr[i]] = '<h>';
		}else{
			tags[arr[i]] = '</h>';
		}
	}

	for(let i in linebreaks){
		switch(true){
			case tags[linebreaks[i]] == '<h>':tags[linebreaks[i]] = '<br><h>';break;
			case tags[linebreaks[i]] == '</h>':tags[linebreaks[i]] = '</h><br>';break;
			default: tags[linebreaks[i]] = '<br>';
		}
	}
			
	let keys = Object.keys(tags)

	for(let i = keys.length -1; i > -1; i--){
		str = str.substring(0,keys[i]) + tags[keys[i]] + str.substring(keys[i]);
	}

	$('.string').html(`<div class="quotemark ldquot"></div>${str}<div class="quotemark rdquot"></div>`)
};

const toggleHighlight = ()=>{

	if($('input[name=highlighted]').prop('checked') === true){

		tester.push(selectedRange)

		for(let i in tester){
			for(let j = selectedRange[0]; j < selectedRange[1] + 1; j++){//loop through the character positions in the current selection
				if(inRange(j,...tester[i])){//check if the iterated character position falls within one of the highlight ranges
					ranges.push(Number(i))//record the highlight range iterator
					break;
				}
			}
		}	
	}else{

		for(let i = ranges.length - 1; i > -1; i--){
			tester.splice([ranges[i]],1);
		}

		$('input[name=highlighted]').prop('disabled',difference(...selectedRange) <= 0);
	}

	$('textarea[name=string]').focus();
	renderString();
};

$('input[name=highlighted]').on('input',(e)=>{
	toggleHighlight();
})

// ipcRenderer.send('toggleDevTools')


ipcRenderer.on('successfulDownload',(event,data)=>{
	if(loadThis){
		loadImage(data)
	}
})

/* * * * * * * * * * * * */
const saveImage = ()=>{

	console.log('saveImage')
	// var container = document.getElementById("productionFrame"); //specific element on page
	// // var container = document.body; // full page 
	
	// html2canvas(container,{allowTaint : true}).then(function(canvas) {
	// 	console.log(1)
	// 	var link = document.createElement("a");
	// 	document.body.appendChild(link);
	// 	// link.text = "LINK"
	// 	link.download = "html_image.png";
	// 	link.href = canvas.toDataURL("image/png");
	// 	link.target = '_blank';
	// 	link.click()
	// 	console.log(2)
	// }).catch((err)=>{
	// 	console.log(3)
	// 	if(err) throw err;
	// })

	// html2canvas(container, {
	// 	allowTaint: true,
	// 	onrendered: function(canvas) {
	// 		console.log(1)
	// 		canvas.toBlob(function(blob) {
	// 			console.log(2)
	// 			saveAs(blob, fileName);
	// 		});
	// 	}
	// });

	// domtoimage.toJpeg(document.getElementById('productionFrame'), { quality: 0.95 })
 //    .then(function (dataUrl) {
 //        var link = document.createElement('a');
 //        link.download = 'my-image-name.jpeg';
 //        link.href = dataUrl;
 //        link.click();
 //    });

 	console.log(window.devicePixelRatio)
 	console.log($('.productionFrame').html())


	// let title = new Date().getTime()
	const filename = `${documents+slash}graaphics${slash}quote${slash+title}.jpg`

	// return new Promise((resolve,reject)=>{
	// 	webContents.capturePage({
	// 		x: 0,
	// 		y: 0,
	// 		width: 3000,
	// 		height: productionHeight
	// 	}).then((resolve)=>{
	// 		fs.writeFileSync(filename,resolve.toJPEG(100))
	// 		shell.showItemInFolder(filename)
	// 	}).catch((reject)=>{
	// 		console.log(reject)
	// 	})
	// })


	ipcRenderer.send('win',{
		window: 'savestatic',
		width: productionWidth / window.devicePixelRatio,
		height: productionWidth * productionRatio / window.devicePixelRatio,
		resizable: false,
		minimizable: false,
		fullscreen: false,
		closable: true,
		titleBarStyle: 'none',
		backgroundColor: "#000",
		opacity: 0,
		frame: false,
		data: {
			html: $('.productionFrame').html(),
			filename: filename,
		},
	});
};
/* * * * * * * * * * * * */

// document.ready = initialise();
// setTimeout(initialise,2500)
$('body').ready(ipcRenderer.send('initialise','quote'));
ipcRenderer.once('initialise',(event,data)=>{
	initialise(data);
});