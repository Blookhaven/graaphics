'use strict';

const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

$('body').append(`
	<div class="titleBar">Search Image Archive</div>
	<main>
		<input type="text" id="searchField" placeholder="Search" value="bushfire">
		<div class="container">
			<div id="thumbsBox"></div>
		</div>
		<div class="buttons">
			<div class="more displayNone" title="Show more results"></div>
		</div>


		<div id="dialog_bg">
			<div id="dialog_box"></div>
		</div>
	</main>
	<div class="wait displayNone">
		<div class="loadingIcon"></div>
	</div>
`)

$('#searchField').focus();

$(window).on('keydown',(e)=>{/*close the window when escape key is pressed*/
	if(e.keyCode === 27 && $('.wait').hasClass('displayNone')){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})

// $('[name=searchField]').on('keydown',(e)=>{
$('#searchField').on('keydown',(e)=>{
	if(e.keyCode === 13){
		searchImages(true);
	}
})

// ipcRenderer.on('successfulDownload',()=>{
ipcRenderer.on('nodesent',()=>{
	remote.BrowserWindow.getFocusedWindow().close();
});

ipcRenderer.send('winload');
ipcRenderer.on('windata',(event,data)=>{
	window['windata'] = data;//might not be necessaray
	// console.log(windata)
})

/*********************************/

var images = [];
var thumbs_displayed = 0;
var add_this_many = 20;
var blocks_added = 1;
var api_page_num = 1;
var api_page_size = 100;// add_this_many * 2;// 50;
var current_image_search;
var searchField = document.getElementById('searchField');
var total_image = 0;
var total_aap = 0;
var total_epa = 0;
var total_pr = 0;
var total_ap = 0;
var total_filtered = 0;
let storageObject = {
	filter:'aapimage'
};
var filterLabels = {
	"aapimage":"AAP Image",
	"pr image":"PR Handout",
	"epa":"EPA",
	"ap":"AP"
}

function searchImages(new_search){

	$('#dialog_box').html('<div class="loading_icon"></div>');
	$('#dialog_bg').fadeIn(100);	
	$('.searchBtn').unbind();

	if(new_search){
		
		images = [];
		thumbs_displayed = 0;
		blocks_added = 1;
		api_page_num = 1;
		api_page_size = 100;
		total_image = 0;
		total_aap = 0;
		total_epa = 0;
		total_pr = 0;
		total_ap = 0;
		total_filtered = 0;

		$('.img_thumb').remove();
	}
	
	var pay_load;

	if(storageObject['filter'] != undefined){
		if(storageObject.filter != 'ap'){
			pay_load = JSON.stringify({"MediaTypes":["image"],"Credits":[storageObject.filter]});
		}else{

			var now = new Date();
			var nowYear = now.getFullYear();
			var nowMonth = now.getMonth() + 1;
			if(nowMonth < 10){
				nowMonth = '0' + nowMonth;
			}
			var nowDate = now.getDate();
			if(nowDate < 10){
				nowDate = '0' + nowDate;
			}
			var End = nowYear + '-' + nowMonth + '-' + nowDate;
			var thirtyDaysAgo = new Date(now - (30*24*3600*1000));
			var thirtyDaysAgoYear = thirtyDaysAgo.getFullYear();
			var thirtyDaysAgoMonth = thirtyDaysAgo.getMonth() + 1;
			if(thirtyDaysAgoMonth < 10){
				thirtyDaysAgoMonth = '0' + thirtyDaysAgoMonth;
			}
			var thirtyDaysAgoDate = thirtyDaysAgo.getDate();
			if(thirtyDaysAgoDate < 10){
				thirtyDaysAgoDate = '0' + thirtyDaysAgoDate;
			}
			var Start = thirtyDaysAgoYear + '-' + thirtyDaysAgoMonth + '-' + thirtyDaysAgoDate;

			pay_load = JSON.stringify({"MediaTypes":["image"],"Credits":[storageObject.filter],"DateRange":[{"Start":Start,"End":End}],"DateCreatedFilter":"true"});
		}
	}else{
		pay_load = JSON.stringify({"MediaTypes":["image"],"Credits":["aapimage"]});
	}

	$.ajax({
		type: "POST",
		// url: "https://${localStorage['api']}/Assets/search?Query=" + searchField.value + "&pageNumber=" + api_page_num + "&pageSize=" + api_page_size + "&allContent=undefined",
		url: `https://${localStorage['api']}/Assets/search?Query=${searchField.value}&pageNumber=${api_page_num}&pageSize=${api_page_size}&allContent=undefined`,
		contentType: 'application/json',
		data: pay_load,
	
		success: function(data){
			// console.log(data)
			if(data.Total <= 0){//If there are no results clear the search.
				clear_search();
				return false;
			}
			total_image = data.FacetResults.MediaTypes[0].Count;
			// for(var i = 0; i < data.FacetResults.Credits.length; i ++){//Add up totals of each filtered image credit returned by search
			// 	if(data.FacetResults.Credits[i].Name == 'aapimage'){// && $('[name=aapimage]').prop('checked')){
			// 		total_aap = data.FacetResults.Credits[i].Count;
			// 	}
			// 	if(data.FacetResults.Credits[i].Name == 'epa'){// && $('[name=epa]').prop('checked')){
			// 		total_epa = data.FacetResults.Credits[i].Count;
			// 	}
			// 	if(data.FacetResults.Credits[i].Name == 'pr image'){// && $('[name="pr image"]').prop('checked')){
			// 		total_pr = data.FacetResults.Credits[i].Count;
			// 	}
			// 	if(data.FacetResults.Credits[i].Name == 'ap'){// && $('[name=ap]').prop('checked')){//console.log(data.FacetResults)
			// 		total_ap = data.FacetResults.Credits[i].Count;
			// 	}
			// }
			if(total_image > 0){
				// console.warn(data.Assets.length)
				for(var i = 0; i < data.Assets.length; i++){
					// if(data.Assets[i].AssetType == 'IMAGE'){
					// 	if(data.Assets[i].Credit == 'AAP Image'){// && $('[name=aapimage]').prop('checked')){
					// 		images.push(data.Assets[i]);
					// 	}
					// 	if(data.Assets[i].Credit == 'EPA'){// && $('[name=epa]').prop('checked')){
					// 		images.push(data.Assets[i]);
					// 	}
					// 	if((data.Assets[i].Credit == 'PR Handout Image' || data.Assets[i].Credit == 'PR')){// && $('[name="pr image"]').prop('checked')){
					// 		images.push(data.Assets[i]);
					// 	}
					// 	if(data.Assets[i].Credit == 'AP'){// && $('[name=ap]').prop('checked')){
					// 		images.push(data.Assets[i]);
					// 	}
					// }else{
					// 	console.warn(data.Assets[i].AssetType)
					// }
					images.push(data.Assets[i]);
				}
			}
			if(current_image_search != searchField.value){//Add totals together, if there are no results clear the search.
				// console.error('!')
				// total_filtered = total_aap + total_epa + total_pr + total_ap;
				total_filtered = images.length//total_aap + total_epa + total_pr + total_ap;
				if(total_filtered <= 0){
					clear_search();
					return false;
				}
			}
			check_length();
		}
	});
};

function clear_search(){
	$('.more').addClass('displayNone');

	if(storageObject.filter != undefined){
		if(storageObject.filter != 'ap'){
			alert('No results found for\n' + filterLabels[storageObject.filter] + ': "' + searchField.value + '"');
		}else{
			alert('No results found for\n' + filterLabels[storageObject.filter] + ': "' + searchField.value + '"\ncreated in the last thirty days.');
		}
	}else{
		alert('No results found for\n' + searchField.value + '"')
		alert('Yea, Nah.\n\n\nNone.')
	}
	
	
	$('#dialog_bg').fadeOut(100);
}

function check_length(){

	$('#dialog_bg').fadeOut(100);
	$('[name=searchField]').blur()
	$('.more').addClass('displayNone');

	current_image_search = searchField.value;

	/*Remember search word*/
	// storageObject.imageSearch = current_image_search;
	// localStorage.setItem(queryParams.n,JSON.stringify(storageObject));
	/*Remember search word*/

	// console.log(images)

	// console.log('total_filtered: ' + total_filtered)
	// console.log('total_image: ' + total_image)
	// console.log('images.length: ' + images.length)
	// console.log('thumbs_displayed: ' + thumbs_displayed)
	// console.log('add_this_many * blocks_added = ' +  add_this_many * blocks_added)
	
	if(images.length >= (add_this_many * blocks_added)){
	// if(total_image >= (add_this_many * blocks_added)){
	// if(total_image > thumbs_displayed){

		// console.log('thumbs_displayed: ' + thumbs_displayed)
		// console.log('add_this_many * blocks_added = ' +  add_this_many * blocks_added)
		
		for(var i = thumbs_displayed; i < (add_this_many * blocks_added); i++){
			$('#thumbsBox').append('<div class="img_thumb" id="img_thumb_' + thumbs_displayed + '" name="' + thumbs_displayed + '"><div class="img_thumb_pic"></div><div class="img_thumb_txt"><span class="img_txt_title">' + (i + 1) + ' of ' + total_image + '<br>' + images[i].Title + '</span><br><span class="img_txt_credit">' + images[thumbs_displayed].Credit + '</span></div></div>');
			$('#img_thumb_' + thumbs_displayed + ' .img_thumb_pic').css({'background-image':'url(' + images[thumbs_displayed].Thumbnail.Href + ')'});
			thumbs_displayed ++;			
		}

		if(thumbs_displayed >= add_this_many){
			blocks_added ++;
		}

		$('.more').removeClass('displayNone');		
	}else{

		for(var i = thumbs_displayed; i < images.length; i++){
			$('#thumbsBox').append('<div class="img_thumb" id="img_thumb_' + thumbs_displayed + '" name="' + thumbs_displayed + '"><div class="img_thumb_pic"></div><div class="img_thumb_txt"><span class="img_txt_title">' + (i + 1) + ' of ' + total_image + '<br>' + images[i].Title + '</span><br><span class="img_txt_credit">' + images[thumbs_displayed].Credit + '</span></div></div>');
			$('#img_thumb_' + thumbs_displayed + ' .img_thumb_pic').css({'background-image':'url(' + images[thumbs_displayed].Thumbnail.Href + ')'});
			thumbs_displayed ++;
		}

		// console.warn('thumbs_displayed: ' + thumbs_displayed)
		// console.warn('total_filtered: ' + total_filtered)

		// if(thumbs_displayed <= total_filtered){
		if(thumbs_displayed < total_image){
			// total_filtered --;
			api_page_num ++;
			searchImages(false);
		}else{
			$('.more').addClass('displayNone');
		}
	}

	// console.log('- - -')

	$('.img_thumb, .img_download').unbind();

	$('.img_thumb').click(function(){

		var this_name = $(this).attr('Name')

		ipcRenderer.send('defineAsset',images[this_name]);

		var node = {
			AssetId: images[this_name].AssetId,
			Layout: images[this_name].Layout.Href,
			Thumbnail: images[this_name].Thumbnail.Href,
			Title: images[this_name].Title,
			Description: images[this_name].Description
		}

		$('#dialog_box').html(`
			<div class="img_prev" id="img_prev_${this_name}" name="${this_name}">
				<div class="img_prev_pic"></div>
				<div style="float: left;height: 35px;line-height: 45px;">${images[this_name].Credit} - <span class="user_select">${images[this_name].AssetId}</span></div>
				
				<!--<a href="https://${localStorage['api']}/Assets/${images[this_name].AssetId}/Original/download">-->
					<div class="img_download"></div>
				<!--</a>-->
				
				
				<div class="img_prev_txt"><span class="img_txt_title">${images[this_name].Title}</span><br><span class="img_txt_description">${images[this_name].Description}</span></div>
			</div>
		`);		
		

		$('.img_prev .img_prev_pic').css({'background-image':'url(' + images[this_name].Layout.Href + ')'});
		$('#dialog_bg').fadeIn(100);

		$('.img_download').unbind().on('click',()=>{
			console.log(JSON.stringify(node));
			ipcRenderer.send('firepic',node)
		})
		
		
		$('.user_select').css({'-webkit-user-select':'auto'});

		$('.img_prev').click(function(){
			return false;
		})

		$('.img_prev .img_download').click(function(){
			$('#dialog_bg').unbind();
			$('#dialog_box').html('<div class="loading_icon"></div>');
		})

		$('#dialog_bg').click(function(){
			$('#dialog_bg').unbind();
			$('#dialog_bg').fadeOut(100,function(){
				$('.img_prev').remove();
			})
		})
	})

	$('.container').animate({scrollTop: $('#thumbsBox')[0].scrollHeight}, 500);
};

$('.more').click(check_length);

$('[name=searchField]').on('change',function(){

	$('.searchBtn').click(function(){

		$('.img_thumb').remove();

		current_image_search = searchField.value;
		images = [];
		thumbs_displayed = 0;
		blocks_added = 1;
		api_page_num = 1;
		api_page_size = 100;
		total_image = 0;
		total_aap = 0;
		total_epa = 0;
		total_pr = 0;
		total_ap = 0;
		total_filtered = 0;

		searchImages(true);
	});
});
$('[type=text]').focus(function(){
	$(this).select();
})