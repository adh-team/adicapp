/*variables de session*/
var storage;
var app={};
var appS={};
var controller;
var urlLocal="http://localhost:81/cache/adic/";
var urlRemoto="http://adondeirenlaciudad.com/";
var appRuta='rApp.php';

var Latitude = undefined;
var Longitude = undefined;
var map;
var markers = [];
var center = [];
var directionsDisplay = null;
var directionsService = null;


/* comentar para subir a produccion*/

//var urlRemoto = urlLocal;

var urlAjax=urlRemoto;

$(document).bind("mobileinit", function(){

    $.mobile.defaultPageTransition = "slidedown";
    $.mobile.loadingMessage = "Cargando app.";

});
var callSuccess = function(data) {
    console.log("WiFi is " + (available ? "available" : "not available"));
};

var callFailure = function(data) {
    console.error("The following error occurred: "+error);
};



// Wait for Cordova to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // Cordova is ready
    //
    function onDeviceReady() {
        initMap();
        //navigator.geolocation.getCurrentPosition(onSuccess, onError);
        //cordova.plugins.diagnostic.isWifiAvailable(callSuccess, callFailure);
    }

    // onSuccess Geolocation
    //
    function onSuccess(position) {

        //var element = document.getElementById('geolocation');
        alert('Latitude: '           + position.coords.latitude              + '<br />' +
         'Longitude: '          + position.coords.longitude             + '<br />' +
         'Altitude: '           + position.coords.altitude              + '<br />' +
         'Accuracy: '           + position.coords.accuracy              + '<br />' +
         'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
         'Heading: '            + position.coords.heading               + '<br />' +
         'Speed: '              + position.coords.speed                 + '<br />' +
         'Timestamp: '          +                                   position.timestamp          + '<br />');
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: '    + error.code    + '\n' +
            'message: ' + error.message + '\n');
    }
    
    $(document).ready(function() {
        var width;
        var height;
        var time;
        var $carousel;

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
                    url  : urlAjax+'classes/'+appRuta,
                    dataType: "json",
                    data : data,
                })
                .done(function( data, textStatus, jqXHR ) {
                    if(data.continuar==="ok"){
                        var activePage = $.mobile.pageContainer.pagecontainer("getActivePage").attr('id');
                        if (activePage==="login") {
                            $.mobile.changePage("#main");
                            $('.modal').modal('hide');
                        }

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
                url  : urlAjax+'classes/'+appRuta,
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
                    is_logged_in();
                    ajaxLoader("termina");
                }
                else{
                    ajaxLoader("termina");
                    alertMensaje('usuario o contraseña no son correctos');
                }
            })
            .fail(function( jqXHR, textStatus, errorThrown ) {
                ajaxLoader("termina");
                alertMensaje('revise la coneccion a internet '+errorThrown);
            });

        }
        function alertMensaje(mensaje){
            alert(mensaje);
        }

        /* localstorage */
        function getAppJson(){
            if (storage.app===undefined) {
                var user={
                    token:'',
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
                        token:'',
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
                url: urlAjax+'classes/'+appRuta,
                type: 'post'
            }).done(function(data){
                if (data.continuar==="ok") {
                    var user={
                        token:'',
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
                url: urlAjax+'classes/'+appRuta,
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
                    is_logged_in();
                    ajaxLoader("termina");
                }
                else{
                    ajaxLoader("termina");
                    if (data.mensaje!==undefined){
                        alertMensaje(data.mensaje);
                    }else{
                        alertMensaje('revise la coneccion a internet');
                    }

                }

            }).fail(function( jqXHR, textStatus, errorThrown ) {
                ajaxLoader("termina");
                alertMensaje('revise la coneccion a internet '+errorThrown);
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
            event.preventDefault();
            $.mobile.changePage("#ubicaciones");
            
            var id=$(this).attr('data-id');
            console.log('id:'+id);
            clearMarkers();
            deleteMarkers();
            var $modal=$('#modalUbucacionesBody');
            appS=getAppSession();
            var addresses=appS.addresses;
            var htmlModal='';
            var hasAddress=false;
            for(var i in addresses){
                var address=addresses[i];
                if (address.userid===id && address.latitud!=='' && address.longitud!==''){
                    hasAddress=true;
                    htmlModal+='<li>'+getHTMLUbicaciones(address)+'</li>';
                    var latTmp={lat:+address.latitud,lng:+address.longitud};
                    addMarker(latTmp,address.negocio,"images/png/negocio.png",true) ;

                    /*console.log(addresses[i]);*/

                }

            }
            if(hasAddress){
                $('#modalUbicaciones').modal('show') ;
                $modal.html(htmlModal);
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
            var dias = new Array('Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado');
            semana.primerDia=   dias[dia];
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
                url: urlAjax+'classes/'+appRuta,
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
                    var addresses= data.datos.addresses;
                    appS=getAppSession();
                    appS.addresses=addresses;
                    setAppSession(appS);
                    $("#postContainer").html('<div class="" style="min-height:100vh;height:300px;">Sin publicaciones :(');
                }
                ajaxLoader("termina");

            }).fail(function( jqXHR, textStatus, errorThrown ) {
                $("#postContainer").html('<div class="" style="min-height:100vh;height:300px;">Sin publicaciones :(');
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
                url: urlAjax+'classes/'+appRuta,
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
            '   <div class="card-negocio">'+
            '       <div class="flex-negocio">'+
            '           <div class="col-xs-4 div-flex-negocio">'+
            '               <a class="profile product-content-image flex-negocio .div-flex-negocio" data-userid="'+json.userid+'">'+
            '                   <div class="image-swap img-responsive" style="background-image: url('+urlAjax+'imagenes_/profPicture/'+json.userpic+');">'+
            '                   </div>'+
            '               </a>'+
            '           </div>'+
            '           <div class="col-xs-4 div-flex-negocio">'+
            '               <a data-id="'+json.userid+'" class="goProfile negocio-link"><div>'+json.negocio+'</div></a>'+
            '               <div class="categoria negocios-categoria">'+json.categoria+'</div>'+
            '           </div>'+
            '           <div class="col-xs-4 div-flex-negocio">'+
            '               <div class="categoria">'+
            '                   <a data-id="'+json.userid+'" class="negocio-link ubicacionLink text-center" ><i class="fa fa-map-marker" aria-hidden="true"></i></a>'+
            '               </div>'+
            '           </div>'+
            '       </div>'+
            '   </div>'+
            '</li>';
        }
        function getHTMLUbicaciones(json){
            var addresses="";
            var direccion=""+json.direccion;
            if (direccion!=="" && direccion!=="null") {
                addresses=json.direccion+', '+json.cp+' '+json.municipio+', '+json.estado;
            }
            return ''+
            '   <div class="card-negocio">'+
            '       <div class="flex-negocio">'+
            '           <div class="col-xs-8 div-flex-negocio paddingTB5 maxWidth100P">'+
            '               <a data-lat="'+json.latitud+'" data-lng="'+json.longitud+'" class="centerMap negocio-link"><div>'+addresses+' </div></a>'+
            '           </div>'+
            '           <div class="col-xs-4 div-flex-negocio paddingTB5">'+
            '               <div class="categoria">'+
            '                   <a data-lat="'+json.latitud+'" data-lng="'+json.longitud+'" class="routerMap negocio-link text-center"><div><i class="fa fa-2x fa-location-arrow" aria-hidden="true"></i></div></a>'+
            '               </div>'+
            '           </div>'+
            '       </div>'+
            '   </div>';
        }
        function getHtmlPost(json){

          var addresses="";
          var direccion=""+json.direccion;
          if (direccion!=="" && direccion!=="null") {
             addresses=json.direccion+', '+json.cp+' '+json.municipio+', '+json.estado;
         }
         return ''+
         '<div class="z-panel z-forceBlock bgWhite wow fadeInUp boxShadow" data-wow-duration=".5s" data-wow-delay=".2s">'+
         '    <div class="z-panelHeader noPadding noBorder">'+
         '        <div class="z-row noMargin">'+
         '            <div class="z-col-lg-3 z-col-md-3 z-col-sm-2 z-col-xs-3 noPadding">'+
         '                <form class="z-block h80">'+
         '                    <button name="useridx"  data-id="'+json.userid+'" class="goProfile z-content z-contentMiddle botonFiltroUsuario">'+
         '                        <div class="profileImg panelImg" style="background-image:url(\''+urlAjax+'imagenes_/profPicture/'+json.user_pic+'\');margin-top:10px;"></div>'+
         '                    </button>'+
         '                </form>'+
         '            </div>'+
         '            <div class="z-col-lg-9 z-col-md-9 z-col-sm-10 z-col-xs-7 noPadding">'+
         '                <div class="z-block h80">'+
         '                    <div class="z-content z-contentMiddle">'+
         '                        <form action="" method="post" >'+
         '                            <button name="useridx" class="goProfile noMargin text-uppercase text-uppercase s15 cDark text-bold profileU noBorder bgTransparent noPadding" data-id="'+json.userid+'">'+json.negocio+'</button>'+
         '                        </form>'+
         '                        <form action="" method="post" ><a data-id="'+json.userid+'" class="ubicacionLink cDark">'+addresses+'</a></form>'+
         '                    </div>'+
         '                </div>'+
         '            </div>'+
         '        </div>'+
         '    </div>'+
         '    <div class="z-panelBody z-block overflowHidden noPadding">'+
         '        <div id="" class="bgDarkBlueClear ofertaImg panelImg" style="background-image:url(\''+urlAjax+'imagenes_/post/'+json.image+'\');"></div>'+
         '    </div>'+
         '    <div class="z-row noMargin">'+
         '        <div class="z-col-lg-12 z-col-md-12 z-col-sm-12 z-col-xs-12 bgTransparent">'+
         '            <div class="z-block h80 mh80 overflowAuto">'+
         '                <div class="z-content z-contentMiddle">'+
         '                    <p class="cDark s15">'+
         '                        <span class="text-bold text-uppercase">'+json.title+'</span><br>'+
         '                        <span class="">'+json.description+'</span>'+
         '                    </p>'+
         '                </div>'+
         '            </div>'+
         '        </div>'+
         '    </div>'+
         '</div>';
     }
     function getHtmlImages(json){
      return ' <img class="owl-lazy" data-src="'+json.ubication+json.name+'" alt="'+json.description+'">'
  }
  function getContactoHtml(json){
      return ''+
      '<div>Tel: '+json.number+'</div>'+
      '<div>Correo: '+json.mail+'</div>';
  }
  function getDireccionesHtml(json){
      return ''+
      '<div>Direccion: '+json.direccion+', '+json.cp+' '+json.municipio+' '+json.estado+' '+json.pais+'</div>';
  }
  function ajaxLoader(action){
      if (action==="inicia") {
         $.mobile.loading( "show", {
            text: "Cargando...",
            textVisible: true,
            theme: "b",
            html: "<span class='ui-bar ui-overlay-a ui-corner-all'><img src='images/logos/i.png' class='img-responsive' style='width: 30px;margin: 0 auto;'/>Cargando...</span>"
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
function perfilFunction(negocioId,negocio,postHtml,directions,imgSocio){

  $('#carruselPerfil').html(imgSocio);
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
  var $modal=$('#modalUbucacionesBody');
  var htmlModal='';
  var hasAddress=false;
  appS=getAppSession();
  var addresses=appS.addresses;
  var primer=false;
  for(var i in addresses){
    var address=addresses[i];
    var latTmp={lat:+address.latitud,lng:+address.longitud};
    addMarker(latTmp,address.negocio,"images/png/negocio.png",true) ;
    hasAddress=true;
    htmlModal+='<li><h5><a data-id="'+address.userid+'" class="goProfile " >'+address.negocio+'</a></h5>'+getHTMLUbicaciones(address)+'</li>';

}
if(hasAddress){
    //$('#modalUbicaciones').modal('show') ;
    $modal.html(htmlModal);
}
ajustarMapa();


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
$(document).on('click', '.centerMapGeo', function(event) {
   event.preventDefault();
   ajustarMapa();


});
$(document).on('click', '.routerMap', function(event) {
   event.preventDefault();
   var action=$(this);
   var lat=action.attr('data-lat');
   var lng=action.attr('data-lng');
   enlazarMarcadorClick(+lat,+lng);
   $('#modalUbicaciones').modal('toggle');
   var origen = getOrigin();
   var destino = lat+','+lng;
   window.open("https://www.google.com.mx/maps/dir/"+origen+"/"+destino+"/@"+origen+",16z?hl=es");


});
$(document).on('click', '.goProfile', function(event) {

 event.preventDefault();
 /* Act on the event */
 var id =$(this).attr('data-id');
 var appS=appS=getAppSession();
 appS.negocioId=id;
 setAppSession(appS);
 $.mobile.changePage("#negocio");
 $('.modal').modal('hide');
});
$(document).on('click', '.goProfile', function(event) {

 event.preventDefault();
 /* Act on the event */
 var id =$(this).attr('data-id');
 var appS=appS=getAppSession();
 appS.negocioId=id;
 setAppSession(appS);
 $.mobile.changePage("#negocio");
 $('.modal').modal('hide');
});
$(document).on('click', '.centerMapGeo', function(event) {

 event.preventDefault();
 /* Act on the event */
 var id =$(this).attr('data-id');
 var appS=appS=getAppSession();
 appS.negocioId=id;
 setAppSession(appS);
 $.mobile.changePage("#negocio");
 $('.modal').modal('hide');
});


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
 $('#imgSocio').css('background-image', 'url('+urlAjax+'imagenes_/profPicture/)');
 $('#nombreSocio').html("Negocio");
 $('#ubicacionSocio').attr('data-id',"0");



 ajaxLoader("inicia");
 appS=getAppSession();

 $('#contactoSocio').html("cargando...");
 $('#direccionesSocio').html("cargando...");
 $('#PromocionesPorSocio').html("cargando...");

 if (appS.negocioId!==undefined) {
    var data= {'action': 'getNegocios','categoria':appS.user.categoria};
    $.ajax({
       data:data,
       crossDomain: true,
       cache: false,
       xhrFields: {
          withCredentials: true
      },
      url: urlAjax+'classes/'+appRuta,
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
        $carousel =$('.owl-carousel.owl-loaded');
        if ($carousel[0]) {
           $carousel.data('owl.carousel').destroy(); 
       }

       perfilFunction(negocioId,negocio,"cargando...",directions,'cargando...');
       var data= {'action': 'getPostSocio','iduser':negocioId};
       $.ajax({
           data:data,
           crossDomain: true,
           cache: false,
           xhrFields: {
              withCredentials: true
          },
          url: urlAjax+'classes/'+appRuta,
          type: 'post'
      }).done(function(data){
       var appS = getAppSession();
       var semana=appS.user.semanas.semana;
       var addresses= appS.addresses;
       var directions=appS.negocio.directions;
       var address=appS.negocio.address;

       var hasAddress=appS.negocio.hasAddress;
       if(data.continuar==="ok"){

          var post= data.datos.post;
          var images=data.datos.images;
          var semanaHtml=[];
          var datahtml='';

          for(i in semana){
             semanaHtml[i]='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>';
         }

         for(var i in post) {
             var publicacion=post[i];
             for(i in semana){
                if(semana[i].fecha==publicacion.date){
                   semanaHtml[i]+=getHtmlPost(publicacion);
                   break;
               }

           }
           /*datahtml+=getHtmlPost(publicacion);*/
       }
       for(i in semana){
         if (semanaHtml[i]!='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>') {
            datahtml+=semanaHtml[i];
        }

    }
    images=[
    {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
    ];
    var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
    var htmlImages=getHtmlImages(imagen);
    for(var i in images){
     htmlImages+=getHtmlImages(images[i]);
 }

 perfilFunction(negocioId,negocio,datahtml,directions,htmlImages);



}
else{
  var images=data.datos.images;
  images=[
  {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
  ];
  var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
  var htmlImages=getHtmlImages(imagen);

  for(var i in images){
     htmlImages+=getHtmlImages(images[i]);
 }
 var datahtml='<div class="h50">Sin publicaciones :(';
 perfilFunction(negocioId,negocio,datahtml,directions,htmlImages);


}   
$carousel =$('.owl-carousel');
$carousel.owlCarousel({
  items:1,
  autoHeight:true,
  responsiveClass:true,
  lazyLoad:true,
  loop:true,
  margin:0
}).removeClass('owl-hidden');

ajaxLoader("termina");

}).fail(function( jqXHR, textStatus, errorThrown ) {
   var appS = getAppSession();
   var addresses= appS.addresses;
   var directions=appS.negocio.directions;
   var address=appS.negocio.address;
   var hasAddress=appS.negocio.hasAddress;
   var datahtml='<div class="h50">Sin publicaciones :(';
   images=[
   {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
   ];
   var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
   var htmlImages=getHtmlImages(imagen);
   for(var i in images){
      htmlImages+=getHtmlImages(images[i]);
  }
  perfilFunction(negocioId,negocio,datahtml,appS.addresses,getHtmlImages);
  $carousel =$('.owl-carousel');
  $carousel.owlCarousel({
      items:1,
      autoHeight:true,
      responsiveClass:true,
      lazyLoad:true,
      loop:true,
      margin:0
  }).removeClass('owl-hidden');
  ajaxLoader("termina");
});



break;
}

}


}
else{

}
ajaxLoader("termina");

}).fail(function( jqXHR, textStatus, errorThrown ) {
                        //
                        ajaxLoader("termina");
                    });

}
});







mainFunction();




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
        $("#classIcon").html('<img class="h35" src="images/logos/i.png" alt="logo">');
    }
    else{
        if (id==="-1") {

            appS.user.categoriaNombre="Inicio";
            appS.user.classIcon=icon;
            setAppSession(appS);
            $("#classIcon").html('<img class="h35" src="images/logos/i.png" alt="logo">');
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
    console.log("show de ubicaciones");
    //navigator.geolocation.getCurrentPosition(onSuccess, onError);
    google.maps.event.trigger(map, "resize");

});
function ajustarMapa(){
    getMapLocation();
    var height=$('#ubicaciones').height();
    $('#map').height((height*80)/100);

    google.maps.event.trigger(map, "resize");
    console.log("mapa centrado en: ");
    console.log(center);
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


// Location  gps


// Get geo coordinates 

function getMapLocation() {

    navigator.geolocation.getCurrentPosition
    (onMapSuccess, onMapError, { enableHighAccuracy: true });
}

// Success callback for get geo coordinates 

var onMapSuccess = function (position) {

    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;

    getMap(Latitude, Longitude);

}

// Get map by using coordinates 

function getMap(latitude, longitude) {

    var latLong = new google.maps.LatLng(latitude, longitude);
    var latLng={lat:latitude,lng:longitude};

    addCenter(latLng) ;
    centerMap(latLng,12);
    console.log("mapa cargado y centrado en: "+latitude+","+longitude);
}

// Success callback for watching your changing position 

var onMapWatchSuccess = function (position) {

    var updatedLatitude = position.coords.latitude;
    var updatedLongitude = position.coords.longitude;

    if (updatedLatitude != Latitude && updatedLongitude != Longitude) {

        Latitude = updatedLatitude;
        Longitude = updatedLongitude;

        getMap(updatedLatitude, updatedLongitude);
    }
}

// Error callback 

function onMapError(error) {
    console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
}

// Watch your changing position 

function watchMapPosition() {

    return navigator.geolocation.watchPosition
    (onMapWatchSuccess, onMapError, { enableHighAccuracy: true });
}

//funcion iniciar mapa
function initMap() {
    var styleArray=[{"featureType": "administrative","elementType": "labels.text.fill","stylers": [{"color": "#444444"}]},{"featureType": "administrative.country","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "administrative.province","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "administrative.locality","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "administrative.neighborhood","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "administrative.land_parcel","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "landscape","elementType": "all","stylers": [{"color": "#f2f2f2"}]},{"featureType": "landscape.natural.landcover","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "landscape.natural.terrain","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "poi","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "road","elementType": "all","stylers": [{"saturation": -100},{"lightness": 45},{"visibility": "on"}]},{"featureType": "road.highway","elementType": "all","stylers": [{"visibility": "simplified"}]},{"featureType": "road.arterial","elementType": "labels.icon","stylers": [{"visibility": "off"}]},{"featureType": "transit","elementType": "all","stylers": [{"visibility": "off"}]},{"featureType": "water","elementType": "all","stylers": [{"color": "#46bcec"},{"visibility": "on"}]}];

    var mapOptions = {
        center: new google.maps.LatLng(25.5507416,-103.4577724)
        ,zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styleArray,
        disableDefaultUI: true
    };
    map = new google.maps.Map
    (document.getElementById('map'), mapOptions);
    // funcion para centrar mapa
    getMapLocation();
    showMarkers();
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );
    /*calculateAndDisplayRoute(directionsService, directionsDisplay);*/

}
function removeRoute(){
    directionsDisplay.setMap(null);
}
function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );
    var selectedMode = 'DRIVING';
    var lat=Latitude;
    var lng=Longitude;
    directionsService.route({
    origin: {lat: lat,lng:lng},  // Haight.
    destination: {lat: 25.5507416, lng: -103.4577724},  // Ocean Beach.
    // Note that Javascript allows us to access the constant
    // using square brackets and a string value as its
    // "property."
    travelMode: google.maps.TravelMode[selectedMode]
}, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
  } else {
      window.alert('Directions request failed due to ' + status);
  }
});
}

function addMarker(location,label,icon,enlazar) {
    var marker = new google.maps.Marker({
        position: location,
        icon: icon,
        map: map,
        animation: google.maps.Animation.DROP,
        labelAnchor: new google.maps.Point(300, 100), // Os lo explico después del CSS.
        label:label,
       labelClass: 'labels' // LA CLASE CSS, AQUÍ LLEGA LA MAGIA!!
   });
    markers.push(marker);
    if (enlazar) {
        marker.addListener('click', enlazarMarcador);
    }
}
function addCenter(location) {
    for (var i = 0; i < center.length; i++) {
      center[i].setMap(null);
  }
  center=[];
  var marker = new google.maps.Marker({
    position: location,
    icon: "images/png/usted.png",
    map: map,
    animation: google.maps.Animation.DROP,
        labelAnchor: new google.maps.Point(300, 100), // Os lo explico después del CSS.
        label:'Usted',
       labelClass: 'labels' // LA CLASE CSS, AQUÍ LLEGA LA MAGIA!!
   });
  center.push(marker);

}
function enlazarMarcador(e){
    var lat=Latitude;
    var lng=Longitude;
    var selectedMode = 'DRIVING';
    directionsService.route({
        origin: {lat: lat,lng:lng},
        destination: {lat: e.latLng.lat(), lng: e.latLng.lng()},
        travelMode: google.maps.TravelMode[selectedMode]
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
      } else {
          window.alert('Directions request failed due to ' + status);
      }
  });
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );

};
function enlazarMarcadorClick(elat,elng){
    var lat=Latitude;
    var lng=Longitude;
    var selectedMode = 'DRIVING';
    directionsService.route({
        origin: {lat: lat,lng:lng},
        destination: {lat: elat, lng: elng},
        travelMode: google.maps.TravelMode[selectedMode]
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
      } else {
          window.alert('Directions request failed due to ' + status);
      }
  });
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions( { suppressMarkers: true } );

};

function setMapOnAll(map) {
    for (var i = 0; i < center.length; i++) {
      center[i].setMap(map);
  }
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
    center=[];
    removeRoute();
}
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
}
for (var i = 0; i < center.length; i++) {
    center[i].setMap(null);
}
center =[];
markers = [];
}
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
} else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
}
}
function getOrigin(){
    return Latitude+','+Longitude;
}
