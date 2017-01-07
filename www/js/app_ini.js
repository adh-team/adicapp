/*variables de session*/
var storage;
var app={};
var appS={};
var controller;
var urlLocal="http://localhost:81/cache/adic/";
var urlRemoto="http://adondeirenlaciudad.com/";
//var urlRemoto = urlLocal;

var urlAjax=urlRemoto;
var map;
var markers = [];
$(document).bind("mobileinit", function(){

	$.mobile.defaultPageTransition = "slidedown";
	$.mobile.loadingMessage = "Cargando app.";



});

$(document).ready(function() {
	var width;
	var height;
	var time;

	loaderMain();

	function loaderMain(){
		inicializar();
		is_logged_in();
	}

	function is_token_in(){
		app=getAppJson();
		token=app.user.token;
		if (token==='') {
			is_logged_in();
		}
	}

	function is_logged_in(){
		app=getAppJson();
		email=app.user.email;
		name=app.user.name;
		token=app.user.token;

		if (token!==""||email!==""){
			var data = {'action': 'sesion','token':token,'user_email':email};
			$.ajax({
				type : 'POST',
				crossDomain: true,
				cache: false,
				xhrFields: {
					withCredentials: true
				},
				url  : urlAjax+'classes/ajaxApp.php',
				dataType: "json",
				data : data,
			})
			.done(function( data, textStatus, jqXHR ) {
				if(data.continuar==="ok"){
					$.mobile.changePage("#main");

				}
				else{
					var user={
						token:"",
						email:"",
						name:"",
					};
					app={
						user:user
					};
					setAppJson(app);
					$.mobile.changePage("#login");
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
	function submitFormsubmitFormLogin(){
		ajaxLoader("inicia");
		var data = {'action': 'loginU','logUser':$("#logUser").val(),'logPass':$("#logPass").val()};
		$.ajax({

			type : 'POST',
			crossDomain: true,
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			url  : urlAjax+'classes/ajaxApp.php',
			dataType: "json",
			data : data,
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
				setAppJson(app);
				$.mobile.changePage("#main");
				is_logged_in();
				$('.modal').modal('hide');
				ajaxLoader("termina");
			}
			else{
				ajaxLoader("termina");
				alertMensaje('usuario o contraseña no son correctos');
			}
		})
		.fail(function( jqXHR, textStatus, errorThrown ) {
			ajaxLoader("termina");
			alertMensaje('problemas al iniciar session'+errorThrown);
		});

	}
	function alertMensaje(mensaje){
		alert(mensaje);
	}

	/* localstorage */
	function getAppJson(){
		if (storage.app===undefined) {
			var user={
				token:"",
				email:"",
				name:"",
			};
			app={
				user:user
			};
			setAppJson(app);
		}
		else{
			app=JSON.parse(storage.app);
			if (app.user===undefined) {
				app.user={
					token:"",
					email:"",
					name:"",
				};
				setAppJson(app);
			}
		}
		return app;
	}

	function setAppJson(app){
		storage.app=JSON.stringify(app);
	}

	/* session storage */
	function getAppSession(){
		if (storageS.appS===undefined) {
			var user={
				fecha:"",
				categoria:"",
				vista:"promociones",
			};
			appS={
				user:user
			};
			setAppSession(appS);
		}
		else{
			appS=JSON.parse(storageS.appS);
			if (appS.user===undefined) {
				appS.user={
					fecha:"",
					categoria:"",
					vista:"promociones",
				};
				setAppSession(appS);
			}

		}
		return appS;
	}
	function setAppSession(appS){
		storageS.appS=JSON.stringify(appS);
	}
	/* funcion para logout */
	$("#logOutbtn").on('click', function(){
		ajaxLoader("inicia");
		var data= {'action': 'logout','token':app.user.token};
		$.ajax({
			data:  data,
			crossDomain: true,
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			url: urlAjax+'classes/ajaxApp.php',
			type: 'post'
		}).done(function(data){
			if (data.continuar==="ok") {
				var user={
					token:"",
					email:"",
					name:"",
				};
				app={
					user:user
				};
				setAppJson(app);
				is_logged_in();
				ajaxLoader("termina");
			}

		});
	});
	/*crear cuenta por email*/
	$("#crteAccountE").on('click', function(){
		ajaxLoader("inicia");
		var data= {'action': 'registerU',"mail": $("#ruMail").val(),"pass": $("#ruPass").val()};
		$.ajax({
			data:  data,
			crossDomain: true,
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			url: urlAjax+'classes/ajaxApp.php',
			type: 'post'
		}).done(function(data){
			if(data.continuar==="ok"){
				var user=app.user;
				user.token=data.datos.token;
				user.email=data.datos.row[0].username;
				user.name=data.datos.row[0].username;
				user.rol=data.datos.row[0].role;
				user.id=data.datos.row[0].iduser;
				app.user=user;
				setAppJson(app);
				$.mobile.changePage("#main");
				is_logged_in();
				$('.modal').modal('hide');
				ajaxLoader("termina");
			}
			else{
				ajaxLoader("termina");
				alertMensaje('problemas al iniciar session');
			}

		});
	});
	$(document).on('click', '.toggle-view-promociones', function(event) {
		event.preventDefault();
		appS=getAppSession();
		if (appS.user.vista==="promociones") {
			appS.user.vista="negocios";

		}else{
			appS.user.vista="promociones";

		}
		setAppSession(appS);
		mainFunction();

		/* Act on the event */
	});

	$(document).on('click', '.ubicacionLink', function(event) {
		$.mobile.changePage("#ubicaciones");
		event.preventDefault();
		var id=$(this).attr('data-id');
		console.log('id:'+id);
		clearMarkers();
		deleteMarkers();

		appS=getAppSession();
		var directions=[];
		var addresses=appS.addresses;
		var primer=false;
		for(var i in addresses){

			if (addresses[i].userid===id && addresses[i].latitud!=='' && addresses[i].longitud!==''){
				directions.push(addresses[i]);
				var latTmp={lat:+addresses[i].latitud,lng:+addresses[i].longitud};
				if (primer===false) {
					primer=true;
					centerMap(latTmp,17);

				}

				addMarker(latTmp);
				//console.log(addresses[i]);

			}

		}
		if(primer===false){
			var latlng={lat:25.564653, lng: -103.449304};
			centerMap(latlng,12);
		}
		showMarkers();
		ajustarMapa();
		showMarkers();

	});

	function getMenuCategorias(){
		/*codigo ajax para despues traernos el menu de categorias */
	}
	function getDiaSemana(){
		appS=getAppSession();
		var ahora = new Date();
		var dia= ahora.getDay();
		var fechasDeLaSemana=[];
		var semana={};
		var buttonStart='<button type="button" class="list-group-item cLightGrey s20 square noBorder noMargin bgTransparent searchDay searchDayClick"';
		var buttonEnd='</button>';
		var dias = new Array('Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado');
		semana.primerDia=	dias[dia];
		var stringDia=ahora.getDate();
		var stringMes=(ahora.getMonth()+ 1);
		if (+stringDia<10) {stringDia="0"+stringDia;}
		if (+stringMes<10) {stringMes="0"+stringMes;}
		var fechaSemana=ahora.getFullYear()+'-'+stringMes +'-'+stringDia;
		fechasDeLaSemana[0] ={fecha:fechaSemana,dia:dias[dia]};
		var botones=buttonStart+' value="'+fechaSemana+'" >Hoy'+buttonEnd;
		for (var i = 1; i < 7; i++) {
			despues = ahora.setTime(ahora.getTime() + (1*24*60*60*1000));
			despues = new Date(despues);
			var diaDespues=despues.getDay();
			var stringDia=despues.getDate();
			var stringMes=(despues.getMonth()+ 1);
			if (+stringDia<10) {stringDia="0"+stringDia;}
			if (+stringMes<10) {stringMes="0"+stringMes;}
			fechaSemana=despues.getFullYear()+'-'+stringMes+'-'+stringDia;
			fechasDeLaSemana[i] ={fecha:fechaSemana,dia:dias[diaDespues]};
			botones+=buttonStart+' value="'+fechaSemana+'" >'+dias[diaDespues]+buttonEnd;
		}
		semana.botones=botones;

		if (appS.user.fecha!=="") {
			$(".primerDiaSemana").html(appS.user.fechaNombre);
		}
		else{
			$(".primerDiaSemana").html(semana.primerDia);
		}
		var semanas={
			botones:semana
			,semana:fechasDeLaSemana
		};
		appS.user.semanas=semanas;
		setAppSession(appS);
		$("#diasSemana").html(semana.botones);

	}
	function getPost(){
		ajaxLoader("inicia");
		appS=getAppSession();
		var data= {'action': 'getPost','fecha':appS.user.fecha,'categoria':appS.user.categoria};
		$.ajax({
			data:data,
			crossDomain: true,
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			url: urlAjax+'classes/ajaxApp.php',
			type: 'post'
		}).done(function(data){
			if(data.continuar==="ok"){
				var post = data.datos.post;
				var addresses= data.datos.addresses;
				var datahtml=''+
				'<form class="ui-filterable">'+
				'<input id="filterPublicacionesInput" data-type="search">'+
				'</form>'+
				'<div class="elements" data-filter="true" data-input="#filterPublicacionesInput" id="filterPublicaciones">';
				for(var i in post) {
					var calle="",numero="",municipio="",estado="",pais="",cp="",latitud=0,longitud=0;

					for(var j in addresses){

						if (addresses[j].userid===post[i].userid){
							calle=addresses[j].calle;
							numero=addresses[j].numero;
							municipio=addresses[j].municipio;
							estado=addresses[j].estado;
							pais=addresses[j].pais;
							cp=addresses[j].cp;
							latitud=addresses[j].latitud;
							longitud=addresses[j].longitud;
							break;

						}

					}
					post[i].calle=calle;
					post[i].numero=numero;
					post[i].municipio=municipio;
					post[i].estado=estado;
					post[i].pais=pais;
					post[i].cp=cp;
					post[i].latitud=latitud;
					post[i].longitud=longitud;
					datahtml+='<li>'+getHtmlPost(post[i])+'</li>';
				}
				appS=getAppSession();
				appS.addresses=addresses;
				setAppSession(appS);
				$("#postContainer").html(datahtml);
				$('#filterPublicacionesInput').textinput();
				$('#filterPublicaciones').filterable();

			}
			else{
				$("#postContainer").html('<div class="h50">Sin publicaciones :(');
			}
			ajaxLoader("termina");

		}).fail(function( jqXHR, textStatus, errorThrown ) {
			$("#postContainer").html('<div class="h50">Sin publicaciones :(');
			ajaxLoader("termina");
		});
	}


	function getNegocios(){
		ajaxLoader("inicia");
		appS=getAppSession();
		var data= {'action': 'getNegocios','categoria':appS.user.categoria};
		$.ajax({
			data:data,
			crossDomain: true,
			cache: false,
			xhrFields: {
				withCredentials: true
			},
			url: urlAjax+'classes/ajaxApp.php',
			type: 'post'
		}).done(function(data){
			if(data.continuar==="ok"){
				var datahtml="";
				var datos=data.datos.negocios;
				var datahtml=''+
				'<form class="ui-filterable">'+
				'<input id="filterNegociosInput" data-type="search">'+
				'</form>'+
				'<div class="elements" data-filter="true" data-input="#filterNegociosInput" id="filterNegocios">';

				for(var i in datos) {
					datahtml+=getHTMLNegocios(datos[i]);
				}
				appS=getAppSession();
				appS.negocios=negocios=datos;
				appS.addresses=data.datos.addresses;
				setAppSession(appS);
				datahtml+='</div>';
				$("#postContainer").html(datahtml);
				$('#filterNegociosInput').textinput();
				$('#filterNegocios').filterable();


			}
			else{
				$("#postContainer").html('<div class="h50">Sin negocios :(');
			}
			ajaxLoader("termina");

		}).fail(function( jqXHR, textStatus, errorThrown ) {
			$("#postContainer").html('<div class="h50">Sin negocios :(');
			ajaxLoader("termina");
		});


	}

	$('#sectionPost').xpull({
		'callback':function(){
			mainFunction();
		}
	});
	function getHTMLNegocios(json){

		return ''+
		'<li>'+
		'	<div class="card-negocio">'+
		'		<div class="flex-negocio">'+
		'			<div class="col-xs-4 div-flex-negocio">'+
		'				<a class="profile product-content-image flex-negocio .div-flex-negocio" data-userid="'+json.userid+'">'+
		'					<div class="image-swap img-responsive" style="background-image: url('+urlAjax+'images/profPicture/'+json.userpic+');">'+
		'					</div>'+
		'				</a>'+
		'			</div>'+
		'			<div class="col-xs-4 div-flex-negocio">'+
		'				<a data-id="'+json.userid+'" class="goProfile negocio-link"><div>'+json.negocio+'</div></a>'+
		'				<div class="categoria negocios-categoria">'+json.categoria+'</div>'+
		'			</div>'+
		'			<div class="col-xs-4 div-flex-negocio">'+
		'				<div class="categoria">'+
		'					<a data-id="'+json.userid+'" class="negocio-link ubicacionLink text-center" ><i class="fa fa-map-marker" aria-hidden="true"></i></a>'+
		'				</div>'+
		'			</div>'+
		'		</div>'+
		'	</div>'+
		'</li>';
	}
	function getHtmlPost(json){

		var addresses="";
		if (json.calle!="") {
			addresses=json.calle+' #'+json.numero+', '+json.cp+' '+json.municipio+', '+json.estado;
		}
		return ''+
		'<div class="z-panel z-forceBlock bgWhite wow fadeInUp boxShadow" data-wow-duration=".5s" data-wow-delay=".2s">'+
		'	<div class="z-panelHeader noPadding noBorder">'+
		'		<div class="z-row noMargin">'+
		'			<div class="z-col-lg-3 z-col-md-3 z-col-sm-2 z-col-xs-3 noPadding">'+
		'				<form class="z-block h80">'+
		'					<button name="useridx"  data-id="'+json.userid+'" class="goProfile z-content z-contentMiddle botonFiltroUsuario">'+
		'						<div class="profileImg panelImg" style="background-image:url(\''+urlAjax+'images/profPicture/'+json.user_pic+'\');margin-top:10px;"></div>'+
		'					</button>'+
		'				</form>'+
		'			</div>'+
		'			<div class="z-col-lg-9 z-col-md-9 z-col-sm-10 z-col-xs-7 noPadding">'+
		'				<div class="z-block h80">'+
		'					<div class="z-content z-contentMiddle">'+
		'						<form action="" method="post" >'+
		'							<button name="useridx" class="goProfile noMargin text-uppercase text-uppercase s15 cDark text-bold profileU noBorder bgTransparent noPadding" data-id="'+json.userid+'">'+json.negocio+'</button>'+
		'						</form>'+
		'						<form action="" method="post" ><a data-id="'+json.userid+'" class="ubicacionLink cDark">'+addresses+'</a></form>'+
		'					</div>'+
		'				</div>'+
		'			</div>'+
		'		</div>'+
		'	</div>'+
		'	<div class="z-panelBody z-block overflowHidden noPadding">'+
		'		<div id="" class="bgDarkBlueClear ofertaImg panelImg" style="background-image:url(\''+urlAjax+json.image+'\');"></div>'+
		'	</div>'+
		'	<div class="z-row noMargin">'+
		'		<div class="z-col-lg-12 z-col-md-12 z-col-sm-12 z-col-xs-12 bgTransparent">'+
		'			<div class="z-block h80 mh80 overflowAuto">'+
		'				<div class="z-content z-contentMiddle">'+
		'					<p class="cDark s15">'+
		'						<span class="text-bold text-uppercase">'+json.title+'</span><br>'+
		'						<span class="">'+json.description+'</span>'+
		'					</p>'+
		'				</div>'+
		'			</div>'+
		'		</div>'+
		'	</div>'+
		'</div>';
	}
	
	function getContactoHtml(json){
		return ''+
		'<div>Tel: '+json.number+'</div>'+
		'<div>Correo: '+json.mail+'</div>';
	}
	function getDireccionesHtml(json){
		return ''+
		'<div>Direccion: '+json.calle+' '+json.numero+', '+json.cp+' '+json.municipio+' '+json.estado+' '+json.pais+'</div>';
	}
	function ajaxLoader(action){
		if (action==="inicia") {
			$.mobile.loading( "show", {
				text: "Cargando...",
				textVisible: true,
				theme: "b",
				html: "<span class='ui-bar ui-overlay-a ui-corner-all'><img src='images/logos/48x48.png' />Cargando...</span>"
			});
		}
		else{
			if (action==="termina") {
				$.mobile.loading( "hide" );
			}
		}
	}
	function mainFunction(){
		is_token_in();
		app=getAppJson();
		appS=getAppSession();
		if (app.user.name!=="") {$(".usuario_mostrar").html(app.user.name);}
		getDiaSemana();
		getMenuCategorias();
		$vista= $(".toggle-view-promociones");
		if (appS.user.vista==="promociones") {
			$('#openPanelRight').show( "slow" );;
			getPost();
			$vista.attr('tooltip', 'Negocios');
		}
		else{
			$('#openPanelRight').hide( "fast" );;
			$vista.attr('tooltip', 'Promociones');
			getNegocios();
		}
	}
	function perfilFunction(negocioId,negocio,postHtml,directions){
		$('#imgSocio').css('background-image', 'url('+urlAjax+'images/profPicture/'+negocio.userpic+')');
		$('#nombreSocio').html(negocio.negocio);
		$('#ubicacionSocio').attr('data-id',negocio.userid);
		var contactoHtml=getContactoHtml(negocio);
		$('#contactoSocio').html(contactoHtml);
		var direccionesHtml='';
		for(var i in directions){
			direccionesHtml+=getDireccionesHtml(directions[i]);

		}
		$('#direccionesSocio').html(direccionesHtml);
		$('#PromocionesPorSocio').html(postHtml);
	}
	function ubicacionesFunction(){
		app=getAppJson();

		clearMarkers();
		deleteMarkers();

		appS=getAppSession();
		var directions=[];
		var addresses=appS.addresses;
		var primer=false;
		for(var i in addresses){
			var latTmp={lat:+addresses[i].latitud,lng:+addresses[i].longitud};
			if (primer===false) {
				primer=true;
				centerMap(latTmp,14);

			}

			addMarker(latTmp);

		}
		if(primer===false){
			var latlng={lat: 25.5428443, lng: -103.40678609999998};
			centerMap(latlng,13);
		}
		showMarkers();
		ajustarMapa();
		showMarkers();

	}

	function inicializar(){
		/* cambiamos nombre a local storage para un uso mas sensillo y para corregir problemas de navegadores que no lo soportan mas adelante*/
		try {
			if (localStorage.getItem) {
				storage = localStorage;
				storageS = sessionStorage;
			}
		} catch(e) {
			storage = {};
			storageS = {};
		}
		app=getAppJson();
		appS=getAppSession();

		/* validaciones */
		$("#lognUser").validate({
			rules: {
				logUser: {
					required: true,
				},
				logPass: {
					required: true,
					minlength: 5
				}
			},
			messages: {
				logUser: "Porfavor ingresa un usuario valido",
				logPass: "Ingresa una contraseña con mas de 5 caracteres",
			}
		});

		$("#postContainer").on('click', '.botonFiltroUsuario', function(event) {
			event.preventDefault();
			$.mobile.changePage("#negocio");
		});
		$("#categoriasMenu").on('click', '.menuCategoriaClick', function(event) {
			event.preventDefault();
			var id=$(this).attr('data-id');
			var icon=$(this).attr('data-icon');
			var name=$(this).attr('data-name');
			cambioCategoria(id,icon);

			$(".ui-panel").panel("close");

		});
		$(document).on('click', '.categoriaClick', function(event) {
			event.preventDefault();
			var id=$(this).attr('data-id');
			var name=$(this).attr('data-name');
			var icon="";
			switch(+id){

				case -1 :icon="";break;
				case 0 :icon="";break;
				case 1 :icon="fa-beer";break;
				case 2 :icon="fa-cutlery";break;
				case 3 :icon="fa-glass";break;
				case 4 :icon="fa-truck";break;
				case 5 :icon="fa-calendar";break;
			}
			cambioCategoria(id,icon);
		});
		$(document).on('click', '.goProfile', function(event) {
			event.preventDefault();
			/* Act on the event */
			var id =$(this).attr('data-id');
			var appS=appS=getAppSession();
			appS.negocioId=id;
			setAppSession(appS);
			$.mobile.changePage("#negocio");
			//console.log('go profile '+id);

		});
		$(document).on('click','.lgn-with-fb',function(event) {
			var token='swd';
			//var html='<a href="#" rel="'+urlAjax+'facebook.html?token='+token+'" target="_BLANK" class="z-btn btn-rounded h50 bgBlue cWhite s20 text-center noTransform boxShadow link">Facebook</a>';
			var html='<a href="#" rel="'+urlAjax+'facebook.html?token='+token+'" target="_BLANK" class="z-btn btn-rounded h50 bgBlue cWhite s20 text-center noTransform boxShadow link">Facebook</a>';
			//$("#iframemodal .modal-body").html(html);
		});
		$(document).on('click','.link', function(event) {
			event.preventDefault();
			url = $(this).attr("rel");
			//navigator.app.loadUrl(url, {openExternal: true});
			window.open(url,'_blank', 'location=yes');
		});

		function loadURL(url){
			navigator.app.loadUrl(url, { openExternal:true });
			return false;
		}
		$("#diasSemana").on('click', '.searchDayClick', function(event) {
			event.preventDefault();
			$("html, body").animate({ scrollTop: 0 }, "slow");
			appS=getAppSession();
			appS.user.fecha=$(this).val();
			appS.user.fechaNombre=$(this).html();
			setAppSession(appS);
			mainFunction();
			$(".ui-panel").panel("close");

		});
		$(document).on("pagebeforeshow","#main",function(event){
			mainFunction();
		});
		$(document).on("pagebeforeshow","#negocio",function(event){
			is_token_in();
			ajaxLoader("inicia");
			appS=getAppSession();
			if (appS.negocioId!==undefined) {
				var data= {'action': 'getNegocios','categoria':appS.user.categoria};
				$.ajax({
					data:data,
					crossDomain: true,
					cache: false,
					xhrFields: {
						withCredentials: true
					},
					url: urlAjax+'classes/ajaxApp.php',
					type: 'post'
				}).done(function(data){
					if(data.continuar==="ok"){
						appS=getAppSession();
						var negocioId=appS.negocioId;
						var negocios=data.datos.negocios;
						var addresses= data.datos.addresses;
						var address=[];
						var directions=[];
						var hasAddress=false;
						for(var i in addresses){

							if (addresses[i].userid===negocioId){
								directions.push(addresses[i]);
								if(!hasAddress){
									address.push(addresses[i]);
									hasAddress=true;
								}

							}

						}




						appS.negocios=negocios;
						appS.addresses=addresses;
						appS.negocio={
							hasAddress:hasAddress
							,directions:directions
							,address:address

						};
						setAppSession(appS);

						for(var i in negocios) {
							if (negocios[i].userid===negocioId) {
								var negocio=negocios[i];
								var data= {'action': 'getPostSocio','iduser':negocioId};
								$.ajax({
									data:data,
									crossDomain: true,
									cache: false,
									xhrFields: {
										withCredentials: true
									},
									url: urlAjax+'classes/ajaxApp.php',
									type: 'post'
								}).done(function(data){
									var appS = getAppSession();
									var semana=appS.user.semanas.semana;
									var addresses= appS.addresses;
									var directions=appS.negocio.directions;
									var address=appS.negocio.address;
									var hasAddress=appS.negocio.hasAddress;
									if(data.continuar==="ok"){
										
										var post= data.datos;
										var semanaHtml=[];
										var datahtml='';
										for(i in semana){
											semanaHtml[i]='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>';
										}

										for(var i in post) {
											var publicacion=post[i];
											var calle="",numero="",municipio="",estado="",pais="",cp="",latitud=0,longitud=0;
											if(hasAddress){
												calle=address[0].calle;
												numero=address[0].numero;
												municipio=address[0].municipio;
												estado=address[0].estado;
												pais=address[0].pais;
												cp=address[0].cp;
												latitud=address[0].latitud;
												longitud=address[0].longitud;

											}
											publicacion.calle=calle;
											publicacion.numero=numero;
											publicacion.municipio=municipio;
											publicacion.estado=estado;
											publicacion.pais=pais;
											publicacion.cp=cp;
											publicacion.latitud=latitud;
											publicacion.longitud=longitud;
											for(i in semana){
												if(semana[i].fecha==publicacion.date){
													semanaHtml[i]+=getHtmlPost(publicacion);
													break;
												}
												
											}
											//datahtml+=getHtmlPost(publicacion);
										}
										for(i in semana){
											if (semanaHtml[i]!='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>') {
												datahtml+=semanaHtml[i];
											}
											
										}
										
										perfilFunction(negocioId,negocio,datahtml,directions);
										

									}
									else{
										var datahtml='<div class="h50">Sin publicaciones :(';
										perfilFunction(negocioId,negocio,datahtml,directions);
									}
									ajaxLoader("termina");

								}).fail(function( jqXHR, textStatus, errorThrown ) {
									var appS = getAppSession();
									var addresses= appS.addresses;
									var directions=appS.negocio.directions;
									var address=appS.negocio.address;
									var hasAddress=appS.negocio.hasAddress;
									var datahtml='<div class="h50">Sin publicaciones :(';
									perfilFunction(negocioId,negocio,datahtml,appS.addresses);
									ajaxLoader("termina");
								});



								break;
							}

						}


					}
					else{
							//	
						}
						ajaxLoader("termina");

					}).fail(function( jqXHR, textStatus, errorThrown ) {
						//
						ajaxLoader("termina");
					});

				}
			});







mainFunction();

initMap();
/* fin inicializar */
}
function cambioCategoria(id,icon,name){
	$("html, body").animate({ scrollTop: 0 }, "slow");
	appS=getAppSession();
	if (id==="0") {
		appS.user.categoria="0";
		appS.user.categoriaNombre="Inicio";
		appS.user.classIcon=icon;
		setAppSession(appS);
		mainFunction();
		$("#classIcon").html('<img class="h35" src="images/logos/48x48.png" alt="logo">');
	}
	else{
		if (id==="-1") {

			appS.user.categoriaNombre="Inicio";
			appS.user.classIcon=icon;
			setAppSession(appS);
			$("#classIcon").html('<img class="h35" src="images/logos/48x48.png" alt="logo">');
			$.mobile.changePage("#ubicaciones");
			ubicacionesFunction();
		}
		else{
			appS.user.categoria=id;
			appS.user.categoriaNombre=name;
			appS.user.classIcon=icon;
			setAppSession(appS);
			mainFunction();
			$("#classIcon").html('<span class="sidebar-icon fa '+appS.user.classIcon+' cLightGrey"></span>');
		}
	}
}
function openInAppBrowserBlank(url)
{
	try {
		ref = window.open(encodeURI(url),'_blank','location=no');
		ref.addEventListener('loadstop', LoadStop);
		ref.addEventListener('exit', Close);
	}
	catch (err)
	{
		alert(err);
	}
}
function LoadStop(event) {
	if(event.url == "http://www.mypage.com/closeInAppBrowser.html"){
		/*alert("fun load stop runs");*/
		ref.close();
	}
}
function Close(event) {
	ref.removeEventListener('loadstop', LoadStop);
	ref.removeEventListener('exit', Close);
}

$(document).on("pageshow","#ubicaciones",function(){
	console.log("pageshow event fired - pagetwo is now shown");
	google.maps.event.trigger(map, "resize");
});
function ajustarMapa(){
	var center = map.getCenter();
	var height=$('#ubicaciones').height();
	$('#map').height((height*80)/100);


	map.setCenter(center);
	google.maps.event.trigger(map, "resize");
}
$(window).resize(function(event) {
	/* Act on the event */
	var newWidth = $(window).width();
	var newHeight = $(window).height();
	if( newWidth != width || newHeight != height ) {
		width = newWidth;
		height = newHeight;
		clearTimeout(time);
		time = setTimeout(ajustarMapa, 500);
	}
});
/* fin del ready */
});

function initMap() {
	var haightAshbury = {lat: 25.564653, lng: -103.449304};

	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: haightAshbury,
		mapTypeId: google.maps.MapTypeId.TERRAIN
	});


}


function addMarker(location) {
	var marker = new google.maps.Marker({
		position: location,
		map: map
	});
	markers.push(marker);
}


function setMapOnAll(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}
function centerMap(latLng,z){
	map.setCenter(latLng);
	map.setZoom(z);
}

function clearMarkers() {
	setMapOnAll(null);
}

function showMarkers() {
	setMapOnAll(map);
}


function deleteMarkers() {
	clearMarkers();
	markers = [];
}
