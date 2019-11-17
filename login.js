'use strict';

const electron = require('electron');
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;

let windata;
let user = {};

/*close the window when escape key is pressed*/
$(window).on('keydown',(e)=>{
	if(e.keyCode === 27 && $('.wait').hasClass('displayNone')){
		remote.BrowserWindow.getFocusedWindow().close();
	}
})

ipcRenderer.send('winload');
ipcRenderer.on('windata',(event,data)=>{
	windata = data;//might not be necessaray
})

ipcRenderer.on('loginSuccess',(event)=>{
	remote.BrowserWindow.getFocusedWindow().close();
})

////////////////////////////////////////////////////

$('body').append(`
	<div class="titleBar">Login</div>
	<main>
		<input type="text" name="api" placeholder="API">
		<input type="text" name="user" placeholder="Username">
		<input type="password" name="pass" placeholder="Password">
		<div class="buttons">
			<input type="button" name="cancel" value="Cancel">
			<input type="button" name="login" value="Login">
		</div>
	</main>
	<div class="wait displayNone">
		<div class="loading_icon"></div>
	</div>
`)

const login = ()=>{
	$('.wait').removeClass('displayNone');
	$('[type=text],[type=password]').blur();

	user['Username'] = $('[name=user]').val();
	user['Password'] = $('[name=pass]').val();

	$.ajax({
		withCredentials: true,
		url:`https://${api}/Users/login`,
		data : user,
		type:'POST',
		crossDomain: true,

		success: (data)=>{
			localStorage.setItem('api',api);
			localStorage.setItem('Username',user['Username']);
			user['ContactName'] = data['ContactName'];
			ipcRenderer.send('loginSuccess',user);
		},
		error: ()=>{
			localStorage.removeItem('Username');
			$('.wait').addClass('displayNone');
			$('[name=user]').val('').focus();
			$('[name=pass]').val('');
			alert('Login Failed');
		}
	});
};

$('[name=api]').on('change',()=>{
	window['api'] = $('[name=api]').val();
	$('[name=user]').focus();
})

$('[name=user]').on('keydown',()=>{
	if(event.keyCode === 13){
		$('[name=pass]').focus();
	}
})

$('[name=pass]').on('keydown',()=>{
	if(event.keyCode === 13){

		if($('[name=user]').val() == ''){
			$('[name=user]').focus();
		}else{
			login();
		}
	}
})

$('[name=cancel]').on('click',()=>{
	remote.BrowserWindow.getFocusedWindow().close();
})

$('[name=login]').on('click',login);

$(document).ready(()=>{

	if(localStorage['Username']){
		user['Username'] = localStorage.getItem('Username');
		$('[name=user]').val(user['Username']);
		$('[name=pass]').focus();
	}else{
		$('[name=user]').focus();
	}

	if(localStorage['api']){
		window['api'] = localStorage.getItem('api')
		$('[name=api]').remove();
	}else{
		$('[name=api]').focus();
	}
})