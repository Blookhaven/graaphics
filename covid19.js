'use strict'

const electron = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');

const Client = require('ftp');//https://www.npmjs.com/package/ftp

const request = require('request')

// const domtoimage = require('dom-to-image');
// const html2canvas = require('html2canvas');

const remote = electron.remote;
const dialog = remote.dialog;
const app = remote.app;
const webContents = remote.getCurrentWebContents();
const shell = electron.shell;//?????
const ipcRenderer = electron.ipcRenderer;

// const GoogleMapsLoader = require('google-maps');

// ipcRenderer.send('toggleDevTools')

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
		<div class="top_left">
			<label for="yy">yy</label>
			<select class="dateString" id="yy">
				<option value="19">19</option>
				<option value="20">20</option>
				<option value="21">21</option>
			</select>
			<label for="mm">mm</label>
			<select class="dateString" id="mm">
				<!--<option value="01">01</option>-->
				<option value="02">02</option>
				<option value="03">03</option>
				<option value="04">04</option>
				<option value="05">05</option>
				<option value="06">06</option>
				<option value="07">07</option>
				<option value="08">08</option>
				<option value="09">09</option>
				<option value="10">10</option>
				<option value="11">11</option>
				<option value="12">12</option>
			</select>
			<label for="dd">dd</label>
			<select class="dateString" id="dd">
				<option value="01">01</option>
				<option value="02">02</option>
				<option value="03">03</option>
				<option value="04">04</option>
				<option value="05">05</option>
				<option value="06">06</option>
				<option value="07">07</option>
				<option value="08">08</option>
				<option value="09">09</option>
				<option value="10">10</option>
				<option value="11">11</option>
				<option value="12">12</option>
				<option value="13">13</option>
				<option value="14">14</option>
				<option value="15">15</option>
				<option value="16">16</option>
				<option value="17">17</option>
				<option value="18">18</option>
				<option value="19">19</option>
				<option value="20">20</option>
				<option value="21">21</option>
				<option value="22">22</option>
				<option value="23">23</option>
				<option value="24">24</option>
				<option value="25">25</option>
				<option value="26">26</option>
				<option value="27">27</option>
				<option value="28">28</option>
				<option value="29">29</option>
				<option value="30">30</option>
				<option value="31">31</option>
			</select>
			<br>
			<input class="remember" type="text" name="ftpClient" placeholder="ftpClient">
			<input class="remember" type="text" name="ftpUser" placeholder="ftpUser">
			<input class="remember" type="password" name="ftpPass" placeholder="ftpPass">
			<input class="remember" type="text" name="dataURL" placeholder="dataURL" value="hosted.aap.com.au/interactives/covid19/script/dates">
			<button>Publish</button>
		</div>
		<div class="top_right">Photos</div>
		<div class="picCol">
			<div class="more" id="morePic"></div>
		</div>

		<div id="map_box">
			<iframe frameborder="0" scrolling="no" src="http://hosted.aap.com.au/interactives/covid19/index.html"></iframe>
		</div>
	</main>
`);
/*build the DOM*/

if(localStorage['ftpClient']){$('[name=ftpClient').val(localStorage['ftpClient'])}
if(localStorage['ftpUser']){$('[name=ftpUser').val(localStorage['ftpUser'])}
if(localStorage['ftpPass']){$('[name=ftpPass').val(localStorage['ftpPass'])}
if(localStorage['dataURL']){$('[name=dataURL').val(localStorage['dataURL'])}

$('.remember').off().on('change',(e)=>{
	let x = e.target;
	localStorage.setItem(x.name,x.value)
})

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
let today = new Date();
let dates;
let dateKeys;
const initialise = (num)=>{
	console.log(`initialise(${num})`)
	/*map bits*/
	$.getJSON(`http://${$('[name=dataURL]').val()}.js?t=${new Date().getTime()}`,function(data){
		console.log($('[name=dataURL]').val())
		dates = data;
		dateKeys = Object.keys(dates);console.log(dateKeys)
	})
	.done(loadDate)
	.fail(function(err){
		console.log(err)
	})

	// window['today'] = new Date();
	today.setDate(today.getDate() - 1);/*SET BACK BY ONE DAY TO GET LATEST REPORT ON UTC*/
	window['yyStr'] = today.getFullYear() - 2000;
	window['mmStr'] = today.getMonth() + 1;
	if(mmStr < 10){
		mmStr = '0' + mmStr;
	}
	window['ddStr'] = today.getDate();
	if(ddStr < 10){
		ddStr = '0' + ddStr;
	}

	$('#yy').val(yyStr);
	$('#mm').val(mmStr);
	$('#dd').val(ddStr);

	window['dateString'] = $('#yy').val().toString() + $('#mm').val().toString() + $('#dd').val().toString();
	localStorage.setItem("covidDateString",`20${$('#yy').val().toString()}-${$('#mm').val().toString()}-${$('#dd').val().toString()}`)
	$('.dateString').off().on('change',(e)=>{
		if(e.target.id == 'mm'){$('#dd').val('01')}
		dateString = $('#yy').val().toString() + $('#mm').val().toString() + $('#dd').val().toString();
		localStorage.setItem("covidDateString",`20${$('#yy').val().toString()}-${$('#mm').val().toString()}-${$('#dd').val().toString()}`)
		loadDate();
	})

	if(num != false){
		$('#morePic').off().on('click',()=>{
	
			if(!dates[dateString]){
				dates[dateString] = {
					"images": [],
					"updated": "xxxxxx",
					"act": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"nsw": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"nt": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"qld": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"sa": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"tas": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"vic": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"wa": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					},
					"totals": {
						"Confirmed": 0,
						"New": 0,
						"Deaths": 0,
						"Recoveries": 0
					}
				}
			}
			
			ipcRenderer.send('archive');
		})
	}
	/*map bits*/

	window['query'] = getQueryParams(document.location.search);
	window['tempDir'] = query['tempDir'];console.log(tempDir)
	window['title'] = `quote ${num}`;
	window['initTitle'] = title;
	window['windata'] = null;
};

	ipcRenderer.on('archive',(event,user)=>{

		if(user){
			windata = {
				window: 'covid19pix',
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
//};

/*map bit*/
let localities = []

const loadDate = ()=>{console.log('loadDate')

	if(!dates[dateString]){
		dates[dateString] = {
			"images": [],
			"updated": "xxxxxx",
			"act": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"nsw": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"nt": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"qld": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"sa": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"tas": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"vic": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"wa": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			},
			"totals": {
				"Confirmed": 0,
				"New": 0,
				"Deaths": 0,
				"Recoveries": 0
			}
		}
	}
	dates[dateString]['totals'] = {
		"Confirmed": 0,
		"New": 0,
		"Deaths": 0,
		"Recoveries": 0
	}
	console.log(dates[dateString]['totals'])
	// dateKeys = Object.keys(dates);

	let pix = dates[dateString]['images'];
	// let pin = dates[dateString]['markers'];

	/*COVID*/

	let ausstateterrs = ["Australian Capital Territory","New South Wales","Northern Territory","Queensland","South Australia","Tasmania","Victoria","Western Australia"];
	let short = ["act","nsw","nt","qld","sa","tas","vic","wa"]

	let world
	console.log(`${mmStr}-${ddStr}-20${yyStr}`);
	console.log(Number(dateString))
	$.ajax({
		type: "GET",
		url: `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/${
			dateString.substring(2,4)//	mmStr
		}-${
			dateString.substring(4,6)//	ddStr
		}-20${
			dateString.substring(0,2)//	yyStr
		}.csv`,
		dataType: "text",
		success: function(data) {
			
			// console.log(data.replace('FIPS,Admin2,',''))

			// console.log(
			// 	// data.split(`\n`)
			// 	JSON.stringify(data.split(`\n`))
			// )

			let worldArr = data.split(`\n`)
			let wConfirmed = 0;
			let wNew = 0;
			let wDeaths = 0;
			let wRecoveries = 0;

			// let yesterStr;

			let yesterday = new Date(`20${dateString.substring(0,2)}-${dateString.substring(2,4)}-${dateString.substring(4,6)}`)
			yesterday.setDate(yesterday.getDate() - 1);

			let YyyStr = yesterday.getFullYear() - 2000;
			let YmmStr = yesterday.getMonth() + 1;
			if(YmmStr < 10){
				YmmStr = '0' + YmmStr;
			}
			let YddStr = yesterday.getDate();
			if(YddStr < 10){
				YddStr = '0' + YddStr;
			}

			let yesterStr = `${YyyStr}${YmmStr}${YddStr}`;
			console.log(yesterStr)

			switch(true){
				// case Number(dateString) > 200321:
				case Number(dateString) <= 200321:
				for(let i in ausstateterrs){
					let firsthalf = data.substring(data.indexOf(`${ausstateterrs[i]},Australia`))
					let arr = firsthalf.substring(0,firsthalf.indexOf(`\n`)).split(`,`)
					// console.log(arr)

					// let yesterday = new Date(arr[2])
					// yesterday.setDate(yesterday.getDate() - 1);

					// let YyyStr = yesterday.getFullYear() - 2000;
					// let YmmStr = yesterday.getMonth() + 1;
					// if(YmmStr < 10){
					// 	YmmStr = '0' + YmmStr;
					// }
					// let YddStr = yesterday.getDate();
					// if(YddStr < 10){
					// 	YddStr = '0' + YddStr;
					// }

					// let yesterStr = `${YyyStr}${YmmStr}${YddStr}`

					for(let j in ausstateterrs){
						if(ausstateterrs[j] == arr[0]){
							// console.log(short[j],arr[2],arr[3],arr[4],arr[5])
							
							let New = Number(arr[3]) - Number(dates[yesterStr][short[j]]['Confirmed']);
							// console.log(New)
							if(New < 0){
								New = 0;
							}

							dates[dateString]['updated'] = arr[2]
							dates[dateString][short[j]] = {
								Confirmed:Number(arr[3]),
								New:New,
								Deaths:Number(arr[4]),
								Recoveries:Number(arr[5]),
							}
							// dates[dateString]['totals']['Confirmed'] += dates[dateString][short[j]]['Confirmed']
							// dates[dateString]['totals']['New'] += dates[dateString][short[j]]['New']
							// dates[dateString]['totals']['Deaths'] += dates[dateString][short[j]]['Deaths']
							// dates[dateString]['totals']['Recoveries'] += dates[dateString][short[j]]['Recoveries']
						}
					}

					dates[dateString]['totals']['Confirmed'] += dates[dateString][short[i]]['Confirmed']
					dates[dateString]['totals']['New'] += dates[dateString][short[i]]['New']
					dates[dateString]['totals']['Deaths'] += dates[dateString][short[i]]['Deaths']
					dates[dateString]['totals']['Recoveries'] += dates[dateString][short[i]]['Recoveries']

					// console.log(data.split`\n`)
				}

				/*world*/
				for(let i = 1; i < worldArr.length; i++){
					if(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`).length > 1){//not an empty row

						let thisConfirmed = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[1])
						let thisDeaths = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[2])
						let thisRecoveries = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[3])
						// console.log(thisConfirmed,thisDeaths,thisRecoveries)
						wConfirmed += thisConfirmed
						wDeaths += thisDeaths
						wRecoveries += thisRecoveries
					}
				}
				wNew = wConfirmed - Number(dates[yesterStr]['world']['Confirmed'])
				console.log(dateString,yesterStr,wConfirmed,dates[yesterStr]['world']['Confirmed'],wNew,'* * * * *')
				dates[dateString]['world'] = {
					Confirmed: wConfirmed,
					New: wNew,
					Deaths: wDeaths,
					Recoveries: wRecoveries
				}

				console.log(wConfirmed,wNew,wDeaths,wRecoveries)
				/*world*/
				break;
				
				default:
				for(let i in ausstateterrs){
					let arr = data.substring(data.indexOf(`${ausstateterrs[i]},Australia`),data.indexOf(`,"${ausstateterrs[i]}, Australia"`)).split(',')
					// console.log(arr)

					// let yesterday = new Date(arr[2])
					// yesterday.setDate(yesterday.getDate() - 1);
					// let YyyStr = yesterday.getFullYear() - 2000;
					// let YmmStr = yesterday.getMonth() + 1;
					// if(YmmStr < 10){
					// 	YmmStr = '0' + YmmStr;
					// }
					// let YddStr = yesterday.getDate();
					// if(YddStr < 10){
					// 	YddStr = '0' + YddStr;
					// }
					// let yesterStr = `${YyyStr}${YmmStr}${YddStr}`

					for(let j in ausstateterrs){
						if(ausstateterrs[j] == arr[0]){

							let New = Number(arr[5]) - Number(dates[yesterStr][short[j]]['Confirmed']);
							if(New < 0){
								New = 0;
							}console.log(short[j],New)

							dates[dateString]['updated'] = arr[2]
							dates[dateString][short[j]] = {
								Confirmed:Number(arr[5]),
								New:New,
								Deaths:Number(arr[6]),
								Recoveries:Number(arr[7]),
							}

							// dates[dateString]['totals']['Confirmed'] += dates[dateString][short[j]]['Confirmed']
							// dates[dateString]['totals']['New'] += dates[dateString][short[j]]['New']
							// dates[dateString]['totals']['Deaths'] += dates[dateString][short[j]]['Deaths']
							// dates[dateString]['totals']['Recoveries'] += dates[dateString][short[j]]['Recoveries']
						}
					}

					dates[dateString]['totals']['Confirmed'] += dates[dateString][short[i]]['Confirmed']
					dates[dateString]['totals']['New'] += dates[dateString][short[i]]['New']
					dates[dateString]['totals']['Deaths'] += dates[dateString][short[i]]['Deaths']
					dates[dateString]['totals']['Recoveries'] += dates[dateString][short[i]]['Recoveries']
				}

				/*world*/
				for(let i = 1; i < worldArr.length; i++){
					if(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`).length > 1){//not an empty row

						let thisConfirmed = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[3])
						let thisDeaths = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[4])
						let thisRecoveries = Number(worldArr[i].substring(worldArr[i].indexOf(`:`)).split(`,`)[5])

						wConfirmed += thisConfirmed
						wDeaths += thisDeaths
						wRecoveries += thisRecoveries
					}
				}
				wNew = wConfirmed - Number(dates[yesterStr]['world']['Confirmed'])

				if(wNew < 0){
					wNew = 0;
				}

				dates[dateString]['world'] = {
					Confirmed: wConfirmed,
					New: wNew,
					Deaths: wDeaths,
					Recoveries: wRecoveries
				}

				console.log(wConfirmed,wNew,wDeaths,wRecoveries)
				/*world*/
				break;
			}/*switch*/
			console.warn(wConfirmed,wNew,wDeaths,wRecoveries)
			console.log(dates)
			console.log(dateKeys)
			console.log(dateString)
			console.log(new Date(dates[dateString]['updated']))
			// console.log(JSON.stringify(dates))
			// processData(data.replace('FIPS,Admin2,',''));
	 	},
	 	error:(err)=>{
	 		alert(JSON.stringify(err))
	 		today = new Date();
	 		initialise(false)
	 	}
	});
	/*COVID*/

	/*photos*/
	$('.picBox').remove();
	for(let i in pix){

		var stringEnd = pix[i]['Description'].length;
		var openParentheses = ' NO ARCHIVING'
		if(pix[i]['Description'].indexOf(openParentheses) > 0){
			stringEnd = pix[i]['Description'].indexOf(openParentheses)
		}

		let thisCaption = pix[i]['Description'].substring(0,stringEnd)
		console.log(pix[i])
		$('#morePic').before(`
			<div class="picBox" id="picBox_${i}">
				<img src="${pix[i]['Layout']}">
				<textarea>${thisCaption}</textarea>
				<div class="trash"></div>
			</div>
		`)

		// downloadFile({
		// 	remoteFile: pix[i]['Layout'],
		// 	localFile: `${documents}/graaphics/covid19/layout/${pix[i]['AssetId']}.jpg`
		// })
		// downloadFile({
		// 	remoteFile: pix[i]['Thumbnail'],
		// 	localFile: `${documents}/graaphics/covid19/thumbnail/${pix[i]['AssetId']}.jpg`
		// })
	}

	$('.picBox textarea').off().on('input',(e)=>{
		let x = e.target;
		let i = $(x).parent().index()
		pix[i]['Description'] = $(x).val();
	})

	$('.picCol .trash').off().on('click',(e)=>{
		let x = e.target;
		let reallyDelete = confirm('really delete this photo?')

		if(reallyDelete){
			pix.splice(($(x).parent().index()),1)
			$(x).parent().remove();

			// if the images and markers arrays (and any other values) are all empty, delete the node
			//switch(true){
			//	case pix.length == 0 && pin.length == 0/*plus other conditions...*/:
			//	delete dates[dateString];
			//	break;
			//}
			/*if the images and markers arrays (and any other values) are all empty, delete the node*/
		}
	})
	/*photos*/

	// downloadFile({
	// 	remoteFile: "http://www.planwallpaper.com/static/images/butterfly-wallpaper.jpeg",
	// 	localFile: "/var/www/downloads/butterfly-wallpaper.jpeg",
	// 	onProgress: function (received,total){
	// 		var percentage = (received * 100) / total;
	// 		console.log(percentage + "% | " + received + " bytes out of " + total + " bytes.");
	// 	}
	// }).then(function(){
	// 	console.log("File succesfully downloaded");
	// });
};

$('body').ready(ipcRenderer.send('initialise','covid19'));
ipcRenderer.once('initialise',(event,data)=>{
	initialise(data);
});

ipcRenderer.on('covid19pic',(event,data)=>{
	console.log(data)
	console.log(dateString)

	dates[dateString]['images'][dates[dateString]['images'].length] = data;
	loadDate();
	ipcRenderer.send('nodesent');//this goes to main process then gets sent to covid19pic window to close it
})

let map;
let map_center;
let last_valid_center;
let initialZoom;
let MY_MAPTYPE_ID;
let featureOpts;
let mapOptions;

let styledMapOptions;
let customMapType;

let markersArray = [];

const upload = ()=>{

	/*tidy up*/
	// dateKeys = Object.keys(dates);console.log(dateKeys)
	// for(let i in dateKeys){
	// 	if(dates[dateKeys[i]]['images'].length == 0 && dates[dateKeys[i]]['markers'].length == 0){
	// 		// delete dates[dateKeys[i]]
	// 	}
	// }
	/*tidy up*/

	console.warn('Uploading info')
	console.log(dates)
	console.log(JSON.stringify(dates))
	console.log(tempDir)
	fs.writeFile(`${tempDir}/dates.js`,JSON.stringify(dates),(err)=>{
		if(err){
			alert("An error ocurred creating the file " + err.message);
			console.error("An error ocurred creating the file " + err.message);
		}else{

			let c = new Client;

			c.on('ready', function() {
				console.log('connecting...')
				c.put(`${tempDir}/dates.js`,`/aap-mm-hosted/covid19/script/dates.js`,(err)=>{
					if (err){
						throw err;
						(err)=>{alert(JSON.stringify(err))}
					}
					alert('done!')
					$('#map_box').html(`<iframe frameborder="0" scrolling="no" src="http://hosted.aap.com.au/interactives/covid19/index.html"></iframe>`)
					c.end();
				});
			});

			c.connect({
				host: localStorage['ftpClient'],
				user: localStorage['ftpUser'],
				password:localStorage['ftpPass'],
				keepalive: 1800000
			});
		}
	})
};
$('button').off().on('click',upload)

/**
 * Promise based download file method
 */
function downloadFile(configuration){
	return new Promise(function(resolve, reject){
		// Save variable to know progress
		var received_bytes = 0;
		var total_bytes = 0;

		var req = request({
			method: 'GET',
			uri: configuration.remoteFile
		});

		var out = fs.createWriteStream(configuration.localFile);
		req.pipe(out);

		req.on('response', function ( data ) {
			// Change the total bytes value to get progress later.
			total_bytes = parseInt(data.headers['content-length' ]);
		});

		// Get progress if callback exists
		if(configuration.hasOwnProperty("onProgress")){
			req.on('data', function(chunk) {
				// Update the received bytes
				received_bytes += chunk.length;

				configuration.onProgress(received_bytes, total_bytes);
			});
		}else{
			req.on('data', function(chunk) {
				// Update the received bytes
				received_bytes += chunk.length;
			});
		}

		req.on('end', function() {
			resolve();
		});
	});
}