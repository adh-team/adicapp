/*variables de session*/
var storage;
var $menu;
var app={};
var controller;
/**********************/
$(document).bind("mobileinit", function(){
	
	$.mobile.defaultPageTransition = "slidedown";
	$.mobile.loadingMessage = "Cargando app.";
	
	
	
});
$(document).ready(function() {

	loaderMain();
	function loaderMain(){
		inicializar();
		is_logged_in();
		
	}
	function is_logged_in(){
		app=getJsonApp();
		email=app.user.email;
		name=app.user.name;
		token=app.user.token;

		if (token!==""||email!==""){
			var data = {'action': 'sesion','token':token,'user_email':email};
			$.ajax({
				type : 'POST',
				crossDomain: true,			
				url  : '../classes/ajaxUsers.php',
				dataType: "json",
				data : data,
				cache: false,
			})
			.done(function( data, textStatus, jqXHR ) {
				if(data.continuar==="ok"){
				/*
				logeado
				*/
				$.mobile.changePage("#main");
				//$("#saludo").html('hola '+name);
			}
			else{
				if(data.error!="error")
				{
					/* error 
					$("#error").fadeIn(1000, function(){      
						$("#error").html('<div class="alert alert-danger"> <span class="glyphicon glyphicon-info-sign"></span> &nbsp; '+data.mensaje+' !</div>');
						$("#btn-login").html('<span class="glyphicon glyphicon-log-in"></span> &nbsp; Sign In');
					});*/
					$.mobile.changePage("#login");
					
				}				
			}
			
		})
			.fail(function( jqXHR, textStatus, errorThrown ) {
				$.mobile.changePage("#login");
			});
		}
		else{
			/* no logueado*/
			$.mobile.changePage("#login");
			
		}
	}
	$("#loginU").on('click', function(event) {
		event.preventDefault();
		submitFormsubmitFormLogin();
	});
	/* funcion para login */
	function submitFormsubmitFormLogin()
	{  
		var data = $("#lognUser").serialize();

		$.ajax({

			type : 'POST',
			url  : '../classes/ajaxUsers.php',
			dataType: "json",
			data : data,
			cache: false,			
		})
		.done(function( data, textStatus, jqXHR ) {
			if(data.continuar==="ok"){
				var user=app.user;
				user.token=data.datos.token;
				user.email=data.datos.row[0].username;
				user.name=data.datos.row[0].username;
				user.rol=data.datos.row[0].role;
				user.id=data.datos.row[0].iduser;				
				app.user=user;
				storage.app=JSON.stringify(app);
				$.mobile.changePage("#main");
				is_logged_in();
			}
			else{

				alertMensaje('problemas al iniciar session');
			}
		})
		.fail(function( jqXHR, textStatus, errorThrown ) {
			alertMensaje('problemas al iniciar session'+errorThrown);
		});

	}
	function alertMensaje(mensaje){
		alert(mensaje);
	}
	function inicializar(){
		/* cambiamos nombre a local storage para un uso mas sensillo y para corregir problemas de navegadores que no lo soportan mas adelante*/
		try {
		    if (localStorage.getItem) {
		        storage = localStorage;
		    }
		} catch(e) {
		    storage = {};
		}
		controller = new slidebars();
    	controller.init();
		$menu=$(".menu-pages");
		var menuTemplate=getMenuTemplate();
		if (storage.app===undefined) {
			var user={
				token:"",
				email:"",
				name:"",
			};
			app={
				/* aqui llenaria el menu inicial*/
				menu:menuTemplate,
				user:user
			};
			storage.app=JSON.stringify(app);
		}else{
			app=getJsonApp();
			app.menu=menuTemplate;
			if (app.user===undefined) {
				app.user={
					token:"",
					email:"",
					name:"",
				};
			}
			storage.app=JSON.stringify(app);				
		}
			
			
	}
	function cargarMenus(){
		$menu.each(function(index, el) {
			$(this).html(app.menu);
		});
		$('#openAside').click(function(e){
		  e.preventDefault();
		  e.stopPropagation();
		  toggleAside();
		})

	}
	
	function getJsonApp(){
		app=JSON.parse(storage.app);
		return app;
	}
	function getMenuTemplate(){
		$.ajax({

			type : 'GET',
			url  : '../menu.html',
			cache: false,			
		})
		.done(function( data, textStatus, jqXHR ) {
			app=getJsonApp();
			app.menu=data;
			cargarMenus();
			storage.app=JSON.stringify(app);
		})
		.fail(function( jqXHR, textStatus, errorThrown ) {
			//problema con la carga
		});
	}
});