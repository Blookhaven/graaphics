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

const GoogleMapsLoader = require('google-maps');

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

const documents = app.getPath('documents');console.log(documents)

let slash = '/';
if(os.platform() !== 'darwin'){
  slash = '\\';
}console.log(slash)

/*build the DOM*/
$('body').append(`
	<main>
		<div class="top"></div>
		<div id="map_box"></div>
	</main>
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

	window['textProperties'] = {
		string: '',
		source: '',
		exposition: '',
	};
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
				filters:[{name: 'Images',extensions:['jpg','jpeg','png','pdf','gif']}]
			},(result)=>{
				let file = tempDir.concat(result[0].substring(result[0].lastIndexOf(slash)))
				console.log(file)
				fs.copyFile(result[0],file,(err)=>{
					if(err) throw err;
					loadImage(file);
				});
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

	// $('.grabber').off().on('click mousedown mouseup',tabBindings);
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
	}

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

	if(fs.existsSync(filename)){
		let overwrite = confirm(`${title}.jpg already exists.\nOverwrite file?`)
		console.log(overwrite)
		if(!overwrite){
			return overwrite;
		}
	}


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
$('body').ready(ipcRenderer.send('initialise','fire'));
ipcRenderer.once('initialise',(event,data)=>{
	initialise(data);
});


ipcRenderer.on('firepic',(event,data)=>{
	console.log(data)
	ipcRenderer.send('nodesent')
})









/*map bit*/

GoogleMapsLoader.load(function(google){
	console.log('load_map')
	let map_center = new google.maps.LatLng(-30,133);
	let last_valid_center = map_center;
	let initialZoom = 4;
	let MY_MAPTYPE_ID = 'custom_style';

	var featureOpts = [
		{
			stylers: [
				{ hue: '#7DD124' },
				{ visibility: 'simplified' },
				{ gamma: 0.5 },
				{ weight: 0.5 }
			]
		},
		{
			elementType: 'labels',
			stylers: [
				{ visibility: 'on' }
			]
		},
		{
			featureType: 'water',
			stylers: [
				{ color: '#3390df' }
			]
		}
	];
	var mapOptions = {
		zoom: initialZoom,
		center: map_center,
		mapTypeControlOptions: {
			mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
		},
		mapTypeId: MY_MAPTYPE_ID,
		panControl: false,
		fullscreenControl:false,
		zoomControl: true,
		zoomControlOptions: {
			style: google.maps.ZoomControlStyle.SMALL,
			position: google.maps.ControlPosition.RIGHT_TOP
		}
	};
	let map = new google.maps.Map(document.getElementById('map_box'),mapOptions);
	var styledMapOptions = {name:'Custom Style'};
	var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
	map.mapTypes.set(MY_MAPTYPE_ID, customMapType);


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * */

	let localities = [
		{
			"locality": "Bass Hill",
			"kind": "fire",
			"lat": -33.906628,
			"lon": 151.004135,
			"image": "Maracana_Stadium.jpg",
			"address": "Avenida Maracanã - Maracanã",
			"capacity": "78,639",
			"events": "Football, Opening and Closing Ceremonies",
			"blurb": "The venue of the Olympic opening and closing ceremonies is the spiritual home of Brazilian football. The Maracana was once the largest sporting stadium in the world: it opened for the 1950 World Cup and hosted the final before a crowd of 173,000 paying spectators. Since the stadium was redeveloped in 2010-2013, capacity has reduced to about 79,000 spectators."
		}
	]

	let markersArray = [];

	function setMarkers(map){

		for (var i = 0; i < localities.length; i++){
			
			var siteLatLng = new google.maps.LatLng(localities[i].lat,localities[i].lon);
			var hrIcon = new google.maps.MarkerImage(`images/flamebasic.svg`, null, null, null, new google.maps.Size(40,50));
			
			var marker = new google.maps.Marker({
				map: map,
				// animation: google.maps.Animation.DROP,
				locality: localities[i].locality,
				icon: hrIcon,
				position: siteLatLng,
				// image: localities[i].image,
				// address: localities[i].address,
				// qwerty: localities[i].uiop,
				// capacity: localities[i].capacity,
				// events: localities[i].events,
				// blurb: localities[i].blurb,
				// html: "<div class='infoWindowText'><h1 style='color:#5B8013; font-size:1.2em; margin:0px'>" + localities[i].locality + "</h1><span class='zoom' id='" + localities[i].lat + "_" + localities[i].lon + "' style='cursor:pointer'>...</span></div>"
			});

			markersArray.push(marker);
			// google.maps.event.addListener(marker, "click", show_info);
		}
		// console.log(markersArray)
		// get_bounds();
	};

	$('.top').on('click',setMarkers)
})


// function load_map(){
// 	console.log('load_map')
// 	map_center = new google.maps.LatLng(-30,133);
// 	last_valid_center = map_center;

// 	var featureOpts = [
// 		{
// 			stylers: [
// 				{ hue: '#7DD124' },
// 				{ visibility: 'simplified' },
// 				{ gamma: 0.5 },
// 				{ weight: 0.5 }
// 			]
// 		},
// 		{
// 			elementType: 'labels',
// 			stylers: [
// 				{ visibility: 'on' }
// 			]
// 		},
// 		{
// 			featureType: 'water',
// 			stylers: [
// 				{ color: '#3390df' }
// 			]
// 		}
// 	];
// 	var mapOptions = {
// 		zoom: initialZoom,
// 		center: map_center,
// 		mapTypeControlOptions: {
// 			mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
// 		},
// 		mapTypeId: MY_MAPTYPE_ID,
// 		panControl: false,
// 		fullscreenControl:false,
// 		zoomControl: true,
// 		zoomControlOptions: {
// 			style: google.maps.ZoomControlStyle.SMALL,
// 			position: google.maps.ControlPosition.RIGHT_TOP
// 		}
// 	};
// 	map = new google.maps.Map(document.getElementById('map_box'),mapOptions);
// 	var styledMapOptions = {name:'Custom Style'};
// 	var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);
// 	map.mapTypes.set(MY_MAPTYPE_ID, customMapType);
// };
// load_map();




