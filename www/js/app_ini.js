/*variables de session*/
var storage;
var app = {};
var appS = {};
var controller;
var urlLocal = "http://localhost:81/cache/adic/";
var urlRemoto = "http://adondeirenlaciudad.com/";
var newAjax = "http://api.adondeirenlaciudad.com/"
// newAjax="http://192.168.1.72/adic/html/public/";
var appRuta = 'rApp.php';

var Latitude = undefined;
var Longitude = undefined;
var map;
var markers = [];
var center = [];
var directionsDisplay = null;
var directionsService = null;
var gaPlugin;
var sistemaOperativo;
var iduser;


/* comentar para subir a produccion*/

//var urlRemoto = urlLocal;

var urlAjax = urlRemoto;

/*$(document).bind("mobileinit", function(){
 
 $.mobile.defaultPageTransition = "slidedown";
 $.mobile.loadingMessage = "Cargando app.";
 
 });*/
var callSuccess = function (data)
{/*
 console.log("WiFi is " + (available ? "available" : "not available"));*/
};

var callFailure = function (data)
{/*
 console.error("The following error occurred: "+error);*/
};

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);
//document.addEventListener("resume", onResume, false);

function onDeviceReady()
{
    setTimeout(function ()
    {
        jQuery.getScript("https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyBnDKUoyS0DwTs496UmycEy-GweCIW3m-U&callback=initMap");
        console.log('timer!')
    }, 3800);

    window.ga.startTrackerWithId("UA-90947818-1", 30, function ()
    {
        window.ga.setAllowIDFACollection(true);
    });

    /*gaPlugin = window.plugins.gaPlugin;*/
    /*alert("on init "+device.platform );*/
    /*if (device.platform == "Android"){
     sistemaOperativo = "Android";
     
     } else if (device.platform == "iPhone" || device.platform == "iOS" || device.platform == "iPhone Simulator" ){
     sistemaOperativo = "iOS";
     }*/

}

function onResume()
{
    //alert('iduser '+iduser+' sistema: '+sistemaOperativo);
    $.ajax({
        url: urlAjax + 'classes/' + appRuta,
        type: 'POST',
        dataType: 'json',
        data: {sistema: sistemaOperativo, action: 'logUser', iduser: iduser},
    })
            .done(function ()
            {/*
             console.log("success");*/
            })
            .fail(function ()
            {/*
             console.log("error");*/
            })
            .always(function ()
            {/*
             console.log("complete");*/
            });

}
function set_id(id_user)
{
    iduser = id_user;
}

$(document).ready(function ()
{
    var width;
    var height;
    var time;
    var $carousel;

    loaderMain();

    function loaderMain()
    {
        inicializar();
        is_logged_in();
    }

    function is_token_in()
    {
        // app=getAppJson();
        // token=app.user.token;
        // if (token==='') {
        //     /*is_logged_in();*/
        //     $.mobile.changePage("#login");
        // }
        // else{
        //     set_id(app.user.id);
        // }
    }

    function is_logged_in()
    {
        app = getAppJson();
        email = app.user.email;
        name = app.user.name;
        token = app.user.token;
        $.mobile.changePage("#main");
        // if (token!==""||email!==""){
        //     var data = {'action': 'sesion','token':token,'user_email':email};
        //     $.ajax({
        //         type : 'POST',
        //         crossDomain: true,
        //         cache: false,
        //         xhrFields: {
        //             withCredentials: true
        //         },
        //         url  : urlAjax+'classes/'+appRuta,
        //         dataType: "json",
        //         data : data,
        //     })
        //     .done(function( data, textStatus, jqXHR ) {
        //         if(data.continuar==="ok"){
        //             var activePage = $.mobile.pageContainer.pagecontainer("getActivePage").attr('id');
        //             if (activePage==="login") {
        //                 $.mobile.changePage("#main");
        //                 $('.modal').modal('hide');
        //             }

        //         }
        //         else{
        //             var user={
        //                 token:"",
        //                 email:"",
        //                 name:"",
        //             };
        //             app={
        //                 user:user
        //             };
        //             setAppJson(app);
        //             $.mobile.changePage("#login");
        //         }

        //     })
        //     .fail(function( jqXHR, textStatus, errorThrown ) {
        //         $.mobile.changePage("#login");
        //     });
        // }
        // else{
        //     /* no logueado*/
        //     $.mobile.changePage("#login");

        // }
    }
    $("#loginU").on('click', function (event)
    {
        event.preventDefault();
        submitFormsubmitFormLogin();
    });
    /* funcion para login */
    function submitFormsubmitFormLogin()
    {
        ajaxLoader("inicia");
        var data = {'action': 'loginU', 'logUser': $("#logUser").val(), 'logPass': $("#logPass").val()};
        $.ajax({

            type: 'POST',
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            url: urlAjax + 'classes/' + appRuta,
            dataType: "json",
            data: data,
        })
                .done(function (data, textStatus, jqXHR)
                {
                    if (data.continuar === "ok")
                    {
                        var user = app.user;
                        user.token = data.datos.token;
                        user.email = data.datos.row[0].username;
                        user.name = data.datos.row[0].username;
                        user.rol = data.datos.row[0].role;
                        user.id = data.datos.row[0].iduser;
                        app.user = user;
                        setAppJson(app);
                        set_id(user.id);
                        is_logged_in();
                        ajaxLoader("termina");
                    }
                    else
                    {
                        ajaxLoader("termina");
                        alertMensaje('usuario o contraseña no son correctos');
                    }
                })
                .fail(function (jqXHR, textStatus, errorThrown)
                {
                    ajaxLoader("termina");
                    alertMensaje('revise la coneccion a internet ' + errorThrown);
                });

    }
    function alertMensaje(mensaje)
    {
        alert(mensaje);
    }

    /* localstorage */
    function getAppJson()
    {
        if (storage.app === undefined)
        {
            var user = {
                token: '',
                email: "",
                name: "",
            };
            app = {
                user: user
            };
            setAppJson(app);
        }
        else
        {
            app = JSON.parse(storage.app);
            if (app.user === undefined)
            {
                app.user = {
                    token: '',
                    email: "",
                    name: "",
                };
                setAppJson(app);
            }
        }
        return app;
    }

    function setAppJson(app)
    {
        storage.app = JSON.stringify(app);
    }

    /* session storage */
    function getAppSession()
    {
        if (storageS.appS === undefined)
        {
            var semana = {
                fecha: "",
                botones: ""
            };
            var user = {
                fecha: "",
                semana: semana,
                categoria: "",
                vista: "promociones",
            };
            appS = {
                user: user
            };
            setAppSession(appS);
        }
        else
        {
            appS = JSON.parse(storageS.appS);
            if (appS.user === undefined)
            {
                var semana = {
                    fecha: "",
                    botones: ""
                };
                appS.user = {
                    fecha: "",
                    categoria: "",
                    semana: semana,
                    vista: "promociones",
                };
                setAppSession(appS);
            }

        }
        return appS;
    }
    function setAppSession(appS)
    {
        storageS.appS = JSON.stringify(appS);
    }
    /* funcion para logout */
    $("#logOutbtn").on('click', function ()
    {
        ajaxLoader("inicia");
        var data = {'action': 'logout', 'token': app.user.token};
        $.ajax({
            data: data,
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            url: urlAjax + 'classes/' + appRuta,
            type: 'post'
        }).done(function (data)
        {
            if (data.continuar === "ok")
            {
                var user = {
                    token: '',
                    email: "",
                    name: "",
                };
                app = {
                    user: user
                };
                setAppJson(app);
                is_logged_in();
                ajaxLoader("termina");
            }

        });
    });
    /*crear cuenta por email*/
    $("#crteAccountE").on('click', function ()
    {
        ajaxLoader("inicia");
        var data = {'action': 'registerU', "mail": $("#ruMail").val(), "pass": $("#ruPass").val()};
        $.ajax({
            data: data,
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            url: urlAjax + 'classes/' + appRuta,
            type: 'post'
        }).done(function (data)
        {
            if (data.continuar === "ok")
            {
                var user = app.user;
                user.token = data.datos.token;
                user.email = data.datos.row[0].username;
                user.name = data.datos.row[0].username;
                user.rol = data.datos.row[0].role;
                user.id = data.datos.row[0].iduser;
                app.user = user;
                setAppJson(app);
                is_logged_in();
                ajaxLoader("termina");
            }
            else
            {
                ajaxLoader("termina");
                if (data.mensaje !== undefined)
                {
                    alertMensaje(data.mensaje);
                }
                else
                {
                    alertMensaje('revise la coneccion a internet');
                }

            }

        }).fail(function (jqXHR, textStatus, errorThrown)
        {
            ajaxLoader("termina");
            alertMensaje('revise la coneccion a internet ' + errorThrown);
        });
    });
    $(document).on('click', '.toggle-view-promociones', function (event)
    {
        event.preventDefault();
        appS = getAppSession();
        if (appS.user.vista === "promociones")
        {
            appS.user.vista = "negocios";

        }
        else
        {
            appS.user.vista = "promociones";

        }
        setAppSession(appS);
        mainFunction();

        /* Act on the event */
    });

    $(document).on('click', '.ubicacionLink', function (event)
    {
        event.preventDefault();
        window.ga.trackView('Ubicaciones');
        $.mobile.changePage("#ubicaciones");
        var id = +$(this).attr('data-id');
        var data = {id: id};
        $.ajax({
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            url: newAjax + 'api/v1/address',
            dataType: 'json',
            type: 'get',
            data: data
        })
                .done(function (response)
                {
                    var addresses = response.data;
                    if (addresses.length > 0)
                    {
                        clearMarkers();
                        deleteMarkers();
                        var $modal = $('#modalUbucacionesBody');
                        var htmlModal = '';
                        var hasAddress = false;
                        for (var i in addresses)
                        {
                            var address = addresses[i];
                            if ((address.user_id === id) && (address.lat !== '') && (address.long !== ''))
                            {
                                hasAddress = true;
                                htmlModal += '<li>' + getHTMLUbicaciones(address) + '</li>';
                                var latTmp = {lat: +address.lat, lng: +address.long};
                                addMarker(latTmp, address.negocio, "images/png/negocio.png", true);
                            }

                        }
                        if (hasAddress)
                        {
                            $('#modalUbicaciones').modal('show');
                            $modal.html(htmlModal);
                        }
                        showMarkers();
                        ajustarMapa();
                        showMarkers();
                    }
                })
                .fail(function ()
                {
                    console.log("error");
                })
                .always(function ()
                {
                    console.log("complete");
                });

    });

    function getMenuCategorias()
    {
        /*codigo ajax para despues traernos el menu de categorias */
    }
    function getDiaSemana()
    {
        appS = getAppSession();
        var now = moment().format('YYYY-MM-DD');
        var dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        /*console.log(now);*/
        /*appS.user.semana.fecha="";*/
        if (appS.user.semana == undefined)
        {
            appS.user.semana = {
                fecha: "",
                botones: "",
                dias: dias
            };
        }
        if (((appS.user.semana.fecha == "") || (appS.user.semana.botones == "")) || (appS.user.semana.fecha != now))
        {
            var buttonStart = '<button type="button" class="list-group-item cLightGrey s20 square noBorder noMargin bgTransparent searchDay searchDayClick"';
            var buttonEnd = '</button>';
            $(".primerDiaSemana").html(moment().format('dddd'));

            var botones = "";
            var date = moment();
            botones += buttonStart + ' data-date="' + date.format('YYYY-MM-DD') + '" value="' + date.format('dddd') + '" data-day="' + date.day() + '" >Hoy' + buttonEnd;
            date = moment().add(1, 'day');
            for (var i = 1; i < 7; date = moment().add(i, 'day'))
            {
                botones += buttonStart + '  data-date="' + date.format('YYYY-MM-DD') + '" value="' + date.format('dddd') + '" data-day="' + date.day() + '" >' + date.format('dddd') + buttonEnd;
                i++;
            }
            $("#diasSemana").html(botones);
            var semana = {
                fecha: now,
                dias: dias,
                botones: botones
            };
            appS.user.semana = semana;
            setAppSession(appS);
        }
        else
        {
            $("#diasSemana").html(appS.user.semana.botones);
            if (appS.user.fecha == "")
            {
                appS.user.fecha = moment().format('YYYY-MM-DD');
            }
            $(".primerDiaSemana").html(moment(appS.user.fecha).format('dddd'));
            setAppSession(appS);
        }

    }
    function getPost()
    {
        ajaxLoader("inicia");
        appS = getAppSession();
        var data = {'date': appS.user.fecha, 'category': appS.user.categoria};

        $.ajax({
            data: data,
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            dataType: 'json',
            url: newAjax + 'api/v1/post',
            type: 'get'
        }).done(function (data)
        {
            var post = data.data;
            if (post.length > 0)
            {
                post = post.sort(function ()
                {
                    return Math.random() - 0.5
                });
                /*console.log(post);*/
                /*var addresses= data.datos.addresses;*/
                var datahtml = '' +
                        '<form class="ui-filterable">' +
                        '<input id="filterPublicacionesInput" data-type="search">' +
                        '</form>' +
                        '<div class="elements" data-filter="true" data-input="#filterPublicacionesInput" id="filterPublicaciones">';
                for (var i in post)
                {
                    var user = post[i].public_user;
                    var data = {};
                    if (user)
                    {
                        data = user.public_user_data;
                    }
                    datahtml += '<li>' + getHtmlPost(post[i], post[i].public_user, post[i].public_user.public_user_data) + '</li>';
                }
                appS = getAppSession();
                appS.post = post;
                setAppSession(appS);
                $("#postContainer").html(datahtml);
                $('#filterPublicacionesInput').textinput();
                $('#filterPublicaciones').filterable();
                ajaxLoader("termina");
            }
            else
            {
                $("#postContainer").html('<div class="" style="min-height:100vh;height:300px;">Sin publicaciones :(');
                ajaxLoader("termina");
            }



        }).fail(function (jqXHR, textStatus, errorThrown)
        {
            $("#postContainer").html('<div class="" style="min-height:100vh;height:300px;">Sin publicaciones :(');
            ajaxLoader("termina");
        });
    }


    function getNegocios()
    {
        ajaxLoader("inicia");
        appS = getAppSession();
        var data = {'category': appS.user.categoria};
        $.ajax({
            data: data,
            crossDomain: true,
            cache: false,
            xhrFields: {
                withCredentials: true
            },
            url: newAjax + 'api/v1/userData',
            type: 'get'
        }).done(function (response)
        {
            // console.log(response);
            var datahtml = "";
            var datos = response;
            var datahtml = '' +
                    '<form class="ui-filterable">' +
                    '<input id="filterNegociosInput" data-type="search">' +
                    '</form>' +
                    '<div class="elements" data-filter="true" data-input="#filterNegociosInput" id="filterNegocios" data-divider-theme="d"> ';
            var letra = "";
            var abc = [];

            for (var i in datos)
            {
                var char = datos[i].negocio.substr(0, 1).toUpperCase();
                if (char !== letra)
                {

                    datahtml += '<li data-role="list-divider" data-groupoptions="aaaa" id="datafilterList' + char + '">' + char + '</li>';
                    datahtml += '<li>' + getHTMLNegocios(datos[i]) + '</li>';
                    letra = char;
                    abc.push(letra);
                }
                else
                {
                    datahtml += '<li>' + getHTMLNegocios(datos[i]) + '</li>';
                }



            }
            datahtml += '</div>';
            var datahtmlA = '<div class="alphabeth"><ul>';
            for (var i in abc)
            {
                datahtmlA += '<li><a class="hook-filter" data-hook="' + abc[i] + '" >' + abc[i] + '</a></li>';
            }
            datahtmlA += '</ul></div>';
            datahtmlA = '<div class="alphabeth"><ul id="touchScroller"><li><a class="hook-filter" data-hook="A">A</a></li><li><a class="hook-filter" data-hook="B">B</a></li><li><a class="hook-filter" data-hook="C">C</a></li><li><a class="hook-filter" data-hook="D">D</a></li><li><a class="hook-filter" data-hook="E">E</a></li><li><a class="hook-filter" data-hook="F">F</a></li><li><a class="hook-filter" data-hook="G">G</a></li><li><a class="hook-filter" data-hook="H">H</a></li><li><a class="hook-filter" data-hook="I">I</a></li><li><a class="hook-filter" data-hook="J">J</a></li><li><a class="hook-filter" data-hook="K">K</a></li><li><a class="hook-filter" data-hook="L">L</a></li><li><a class="hook-filter" data-hook="M">M</a></li><li><a class="hook-filter" data-hook="N">N</a></li><li><a class="hook-filter" data-hook="O">O</a></li><li><a class="hook-filter" data-hook="P">P</a></li><li><a class="hook-filter" data-hook="Q">Q</a></li><li><a class="hook-filter" data-hook="R">R</a></li><li><a class="hook-filter" data-hook="S">S</a></li><li><a class="hook-filter" data-hook="T">T</a></li><li><a class="hook-filter" data-hook="U">U</a></li><li><a class="hook-filter" data-hook="V">V</a></li><li><a class="hook-filter" data-hook="X">X</a></li><li><a class="hook-filter" data-hook="Y">Y</a></li><li><a class="hook-filter" data-hook="Z">Z</a></li></ul></div>';
            $("#aphabethContainer").html(datahtmlA);
            $("#postContainer").html(datahtml);
            $('#filterNegociosInput').textinput();
            $('#filterNegocios').filterable();

            ajaxLoader("termina");

        }).fail(function (jqXHR, textStatus, errorThrown)
        {
            $("#postContainer").html('<div class="h50">Sin negocios :(');
            ajaxLoader("termina");
        });


    }

    $('#sectionPost').xpull({
        'callback': function ()
        {
            mainFunction();
        }
    });
    function getHTMLNegocios(json)
    {

        return '' +
                '   <div class="card-negocio">' +
                '       <div class="flex-negocio">' +
                '           <div class="col-xs-4 div-flex-negocio">' +
                '               <a class="profile product-content-image flex-negocio .div-flex-negocio goProfile negocio-link" data-userid="' + json.user_id + '">' +
                '                   <div class="image-swap img-responsive" style="background-image: url(' + urlAjax + 'imagenes_/profPicture/' + json.img + ');">' +
                '                   </div>' +
                '               </a>' +
                '           </div>' +
                '           <a data-id="' + json.user_id + '"class="col-xs-4 div-flex-negocio goProfile negocio-link">' +
                '               <div  class="">' + json.negocio + '</div>' +
                '               <div class="categoria negocios-categoria">' + json.category.nombre + '</div>' +
                '           </a>' +
                '           <a data-id="' + json.user_id + '" class="col-xs-4 div-flex-negocio ubicacionLink ">' +
                '               <div class="categoria">' +
                '                   <div  class="negocio-link  text-center" ><i class="fa fa-map-marker" aria-hidden="true"></i></div>' +
                '               </div>' +
                '           </a>' +
                '       </div>' +
                '   </div>';
    }
    function getHTMLUbicaciones(json)
    {
        var addresses = "";
        var direccion = "" + json.direccion;
        if (direccion !== "" && direccion !== "null")
        {
            addresses = json.direccion + ', ' + json.cp + ' ' + json.municipio + ', ' + json.estado;
        }
        return '' +
                '   <div class="card-negocio">' +
                '       <div data-lat="' + json.lat + '" data-lng="' + json.long + '" class="flex-negocio routerMap negocio-link">' +
                '           <div class="col-xs-8 div-flex-negocio paddingTB5 maxWidth100P">' +
                '               <a  class=" negocio-link"><div>' + addresses + ' </div></a>' +
                '           </div>' +
                '           <div class="col-xs-4 div-flex-negocio paddingTB5">' +
                '               <div class="categoria">' +
                '                   <a data-lat="' + json.lat + '" data-lng="' + json.long + '" class=" negocio-link text-center"><div><i class="fa fa-2x fa-location-arrow" aria-hidden="true"></i></div></a>' +
                '               </div>' +
                '           </div>' +
                '       </div>' +
                '   </div>';
    }
    function getHtmlPost(json, user, data)
    {
        /*console.log(json);*/
        var addresses = "";
        if ((data.address != undefined) && (data.address[0].idaddress != undefined))
        {
            var dir0 = data.address[0];
            addresses = dir0.direccion + ', ' + dir0.cp + ' ' + dir0.municipio + ', ' + dir0.estado;
        }

        return '' +
                '<div class="z-panel z-forceBlock bgWhite wow fadeInUp boxShadow" data-wow-duration=".5s" data-wow-delay=".2s">' +
                '    <div class="z-panelHeader noPadding noBorder">' +
                '        <div class="z-row noMargin">' +
                '            <div class="z-col-lg-3 z-col-md-3 z-col-sm-2 z-col-xs-3 noPadding">' +
                '                <form class="z-block h80">' +
                '                    <button name="useridx"  data-id="' + user.iduser + '" class="goProfile z-content z-contentMiddle botonFiltroUsuario">' +
                '                        <div class="profileImg panelImg" style="background-image:url(\'' + urlAjax + 'imagenes_/profPicture/' + data.img + '\');margin-top:10px;"></div>' +
                '                    </button>' +
                '                </form>' +
                '            </div>' +
                '            <div class="z-col-lg-9 z-col-md-9 z-col-sm-10 z-col-xs-7 noPadding">' +
                '                <div class="z-block h80">' +
                '                    <div class="z-content z-contentMiddle">' +
                '                        <form action="" method="post" >' +
                '                            <button name="useridx" class="goProfile noMargin text-uppercase text-uppercase s15 cDark text-bold profileU noBorder bgTransparent noPadding" data-id="' + user.iduser + '">' + data.negocio + '</button>' +
                '                        </form>' +
                '                        <form action="" method="post" ><a data-id="' + user.iduser + '" class="ubicacionLink cDark">' + addresses + '</a></form>' +
                '                    </div>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '    <div class="z-panelBody z-block overflowHidden noPadding">' +
                '        <div id="" class="bgLightGrey ofertaImg panelImg" style="background-image:url(\'' + urlAjax + 'imagenes_/post/' + json.image + '\');"></div>' +
                '    </div>' +
                '    <div class="z-row noMargin">' +
                '        <div class="z-col-lg-12 z-col-md-12 z-col-sm-12 z-col-xs-12 bgTransparent">' +
                '            <div class="z-block h80 mh80 overflowAuto">' +
                '                <div class="z-content z-contentMiddle">' +
                '                    <div class="cDark s15">' +
                '                        <span class="text-bold text-uppercase">' + json.title + '</span><br>' +
                '                        <span class="">' + json.description + '</span>' +
                '                    </div>' +
                '                </div>' +
                '            </div>' +
                '        </div>' +
                '    </div>' +
                '</div>';
    }
    function getHtmlImages(json)
    {
        return ' <img class="owl-lazy" data-src="' + json.ubication + json.name + '" alt="' + json.description + '">'
    }
    function getContactoHtml(json)
    {
        var public_phone = "";
        var horary = "";
        if (json.public_phone === null || json.public_phone === undefined || json.public_phone === "null")
        {
        }
        else
        {


            public_phone = '<div><a class="s15 text-center cDarkGrey block btn " href="tel:' + json.public_phone + '"> <span class="fa fa-phone-square fa-2x"></span> Llamar ' + json.public_phone + '</a></div>';
        }
        if (json.horary === null || json.horary === undefined || json.horary === "null")
        {
        }
        else
        {


            horary = '<div class="s15 text-center cDarkGrey block text-bold ">Horario: <pre>' + json.horary + '</pre></div>';
        }

        return public_phone + horary;
    }
    function getDireccionesHtml(json)
    {
        var address = '<div><div class="divisionDiaPerfil">' + json.direccion + '</div>';
        address += getContactoHtml(json);
        address += '<div class="text-center">Direccion: ' + json.direccion + ', ' + json.cp + ' ' + json.municipio + ' ' + json.estado + ' ' + json.pais + '</div>';
        address += "</div>";
        return address;
    }
    function ajaxLoader(action)
    {
        if (action === "inicia")
        {
            $.mobile.loading("show", {
                text: "Cargando...",
                textVisible: true,
                theme: "b",
                html: "<span class='ui-bar ui-overlay-a ui-corner-all'>Cargando...</span>"
            });
        }
        else
        {
            if (action === "termina")
            {
                $.mobile.loading("hide");
            }
        }
    }
    function mainFunction()
    {
        is_token_in();
        app = getAppJson();
        appS = getAppSession();
        $('#aphabethContainer').html('');
        if (app.user.name !== "")
        {
            $(".usuario_mostrar").html(app.user.name);
        }
        getDiaSemana();
        getMenuCategorias();
        $vista = $(".toggle-view-promociones");
        if (appS.user.vista === "promociones")
        {
            $('#openPanelRight').show("slow");
            ;
            getPost();
            $vista.attr('tooltip', 'Negocios');
        }
        else
        {
            $('#openPanelRight').hide("fast");
            ;
            $vista.attr('tooltip', 'Promociones');
            getNegocios();
        }
    }
    /*function perfilFunction(negocioId,negocio,postHtml,directions,imgSocio){
     
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
     }*/
    function ubicacionesFunction()
    {
        $.ajax({
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            url: newAjax + 'api/v1/address',
            type: 'get',
            dataType: 'json',
        })
                .done(function (response)
                {
                    var addresses = response.data;
                    if (addresses.length > 0)
                    {
                        clearMarkers();
                        deleteMarkers();
                        var $modal = $('#modalUbucacionesBody');
                        var htmlModal = '<form class="ui-filterable">' +
                                '<input id="filterModalInput" data-type="search">' +
                                '</form>' +
                                '<div class="elements" data-filter="true" data-input="#filterModalInput" id="filterModal">';

                        var hasAddress = false;

                        for (var i in addresses)
                        {
                            var address = addresses[i];
                            var latTmp = {lat: +address.lat, lng: +address.long};
                            addMarker(latTmp, address.negocio, "images/png/negocio.png", true);
                            hasAddress = true;
                            htmlModal += '<li><h5><a data-id="' + address.user_id + '" class="goProfile " >' + address.negocio + '</a></h5>' + getHTMLUbicaciones(address) + '</li>';

                        }
                        if (hasAddress)
                        {
                            htmlModal += '</div>';
                            $modal.html(htmlModal);
                            $('#filterModalInput').textinput();
                            $('#filterModal').filterable();
                        }
                        ajustarMapa();
                    }

                })
                .fail(function ()
                {
                    console.log("error");
                })
                .always(function ()
                {
                    console.log("complete");
                });

    }

    function inicializar()
    {
        /* cambiamos nombre a local storage para un uso mas sensillo y para corregir problemas de navegadores que no lo soportan mas adelante*/
        try
        {
            if (localStorage.getItem)
            {
                storage = localStorage;
                storageS = sessionStorage;
            }
        }
        catch (e)
        {
            storage = {};
            storageS = {};
        }
        app = getAppJson();
        appS = getAppSession();

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

        $("#postContainer").on('click', '.botonFiltroUsuario', function (event)
        {
            event.preventDefault();
            window.ga.trackView('Negocio')
            $.mobile.changePage("#negocio");
        });
        $(document).on('click', '.menuCategoriaClick', function (event)
        {
            /*event.preventDefault();*/

            var id = $(this).attr('data-id');
            var icon = $(this).attr('data-icon');
            var name = $(this).attr('data-name');
            cambioCategoria(id, icon);

            $(".ui-panel").panel("close");

        });
        $(document).on('click', '.categoriaClick', function (event)
        {
            event.preventDefault();
            var id = $(this).attr('data-id');
            var name = $(this).attr('data-name');
            var icon = "";
            switch (+id)
            {

                case - 1 :
                    icon = "";
                    break;
                case 0 :
                    icon = "";
                    break;
                case 1 :
                    icon = "fa-beer";
                    break;
                case 2 :
                    icon = "fa-cutlery";
                    break;
                case 3 :
                    icon = "fa-glass";
                    break;
                case 4 :
                    icon = "fa-truck";
                    break;
                case 5 :
                    icon = "fa-calendar";
                    break;
            }
            cambioCategoria(id, icon);
        });
        $(document).on('click', '.centerMapGeo', function (event)
        {
            event.preventDefault();
            var action = $(this);
            var lat = action.attr('data-lat');
            var lng = action.attr('data-lng');
            enlazarMarcadorClick(+lat, +lng);
            $('#modalUbicaciones').modal('toggle');


        });
        $(document).on('click', '.routerMap', function (event)
        {
            event.preventDefault();
            var action = $(this);
            var lat = action.attr('data-lat');

            var lng = action.attr('data-lng');
            enlazarMarcadorClick(+lat, +lng);
            $('#modalUbicaciones').modal('toggle');
            var origen = getOrigin();
            var destino = lat + ',' + lng;
            if (device.platform == "iPhone" || device.platform == "iOS" || device.platform == "iPhone Simulator")
            {
                window.location.href = ("http://maps.apple.com/maps?saddr=" + origen + "&daddr=" + destino);

            }
            else
            {
                window.location.href = ("https://www.google.com.mx/maps/dir/" + origen + "/" + destino + "/@" + origen + ",16z?hl=es");
            }




        });

        $(document).on('click', '.hook-filter', function (event)
        {
            event.preventDefault();
            var letra = $(this).attr('data-hook');
            var topCoord = $('#datafilterList' + letra);
            if (topCoord[0])
            {
                topCoord = topCoord.offset().top;
                $.mobile.silentScroll(topCoord - 150);
            }

        });


        $(document).on('touchmove', '#touchScroller', function (event)
        {

            event.preventDefault();
            var myLocation = event.originalEvent.changedTouches[0];
            //console.log(myLocation);
            var realTarget = document.elementFromPoint(myLocation.clientX, myLocation.clientY);



            //console.log(realTarget);
            if (realTarget !== null && (realTarget.className === 'hook-filter' || realTarget.className === 'hook-filter hover'))
            {
                $('.hook-filter').removeClass('hover');
                realTarget.className = 'hook-filter hover';
                var topCoord = $('#datafilterList' + realTarget.getAttribute('data-hook'));
                if (topCoord[0])
                {
                    topCoord = topCoord.offset().top;
                    $.mobile.silentScroll(topCoord - 150);
                }
                //console.log("move "+ ' my location '+myLocation+' real target '+realTarget);
            }
        });


        $(document).on('click', '.goProfile', function (event)
        {

            event.preventDefault();
            /* Act on the event */
            var id = $(this).attr('data-id');
            var appS = appS = getAppSession();
            appS.negocioId = id;
            setAppSession(appS);
            window.ga.trackView('Negocio')
            $.mobile.changePage("#negocio");
            $('.modal').modal('hide');
        });



        $("#diasSemana").on('click', '.searchDayClick', function (event)
        {
            event.preventDefault();
            window.ga.trackEvent('Promociones', 'Por dia');
            $("html, body").animate({scrollTop: 0}, "slow");
            appS = getAppSession();

            var date = $(this).data('date');
            var day = $(this).data('day');
            /*console.log(moment(date).format('dddd'));*/

            appS.user.fecha = date;
            appS.user.fechaNombre = $(this).html();

            setAppSession(appS);
            mainFunction();
            $(".ui-panel").panel("close");

        });
        $(document).on("pagebeforeshow", "#main", function (event)
        {
            mainFunction();
            $('#modalUbicaciones').modal('hide');
        });
        $(document).on("pagebeforeshow", "#negocio", function (event)
        {
            is_token_in();
            $('#imgSocio').css('background-image', 'url(' + urlAjax + 'imagenes_/profPicture/)');
            $('#nombreSocio').html("Negocio");
            $('#ubicacionSocio').attr('data-id', "0");
            $('#modalUbicaciones').modal('hide');


            ajaxLoader("inicia");
            appS = getAppSession();

            $('#direccionesSocio').html("cargando...");
            $('#PromocionesPorSocio').html("cargando...");

            if (appS.negocioId !== undefined)
            {
                var id = +appS.negocioId;
                var url = newAjax + 'api/v1/user/' + id;
                $.ajax({
                    crossDomain: true,
                    cache: false,
                    xhrFields: {
                        withCredentials: true
                    },
                    url: url,
                    type: 'get'
                }).done(function (response)
                {
                    appS = getAppSession();
                    var user = response[0];
                    var version = response.version;
                    var negocio = user.public_user_data;
                    var posts = user.post;
                    var addresses = negocio.address;
                    var gallery = negocio.gallery;
                    var dias = appS.user.semana.dias;
                    var postHtml = "";
                    var datahtml = "";
                    var direccionesHtml = "";
                    // console.log(user);
                    $carousel = $('.owl-carousel.owl-loaded');
                    if ($carousel[0])
                    {
                        $carousel.data('owl.carousel').destroy();
                    }
                    $('#nombreSocio').html(negocio.negocio);
                    $('#ubicacionSocio').attr('data-id', user.iduser);
                    // console.log(appS.user.semana.dias);
                    var postdias = [];
                    if (version === undefined || version <= 1.23)
                    {
                        for (i in dias)
                        {
                            var postInDay = false;
                            postHtml = '<div class="divisionDiaPerfil">Publicaciones del dia ' + dias[i] + '</div>';
                            for (var j in posts)
                            {
                                var post = posts[j];
                                if (dias[i] === moment(post.date).format('dddd'))
                                {
                                    postHtml += getHtmlPost(post, user, negocio);
                                    postInDay = true;
                                    continue;
                                }
                            }
                            if (postInDay)
                            {
                                postdias.push(postHtml);
                            }

                        }
                        postHtml = ""
                        for (i in postdias)
                        {
                            postHtml += postdias[i];
                        }
                    }
                    else
                    {
                        for (i in dias)
                        {
                            var postInDay = false;
                            postHtml = '<div class="divisionDiaPerfil">Publicaciones del dia ' + dias[i] + '</div>';
                            for (var j in posts)
                            {
                                var post = posts[j];
                                for (day in post.days)
                                {
                                    if (post.days[day].day.toUpperCase() === dias[i].toUpperCase())
                                    {
                                        postHtml += getHtmlPost(post, user, negocio);
                                        postInDay = true;
                                    }
                                }
                            }
                            if (postInDay)
                            {
                                postdias.push(postHtml);
                            }
                        }
                        postHtml = ""
                        for (i in postdias)
                        {
                            postHtml += postdias[i];
                        }
                    }
                    for (i in addresses)
                    {
                        var address = addresses[i];
                        direccionesHtml += getDireccionesHtml(address);
                    }

                    var imagen = {ubication: 'http://adondeirenlaciudad.com/imagenes_/profPicture/', name: negocio.img};
                    var htmlImages = getHtmlImages(imagen);
                    for (var i in gallery)
                    {
                        htmlImages += getHtmlImages(gallery[i]);
                    }
                    $('#carruselPerfil').html(htmlImages);
                    $('#direccionesSocio').html(direccionesHtml);
                    if (user.post.length == 0)
                    {
                        $('#PromocionesPorSocio').parents('[data-role="collapsible"]').hide();
                    }
                    else
                    {
                        $('#PromocionesPorSocio').parents('[data-role="collapsible"]').show();
                        $('#PromocionesPorSocio').html(postHtml);
                    }

                    window.ga.trackEvent('Negocio', 'Ver negocio', negocio.negocio);
                    $carousel = $('.owl-carousel');
                    $carousel.owlCarousel({
                        items: 1,
                        autoHeight: true,
                        responsiveClass: true,
                        lazyLoad: true,
                        loop: true,
                        margin: 0
                    }).removeClass('owl-hidden');
                    ajaxLoader("termina");

                });
            }
        });
        // $('#carruselPerfil').html(imgSocio);
        // $('#nombreSocio').html(negocio.negocio);
        // $('#ubicacionSocio').attr('data-id',negocio.userid);
        // var contactoHtml=getContactoHtml(negocio);
        // $('#contactoSocio').html(contactoHtml);
        // var direccionesHtml='';
        /*for(var i in directions){
         direccionesHtml+=getDireccionesHtml(directions[i]);
         
         }*/
        /*$('#direccionesSocio').html(direccionesHtml);
         */
        /*perfilFunction(negocio,"cargando...",'cargando...');*/


        // for(i in semana){
        //    semanaHtml[i]='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>';
        // }

//          for(var i in post) {
//              var publicacion=post[i];
//              for(i in semana){
//                 if(semana[i].fecha==publicacion.date){
//                    semanaHtml[i]+=getHtmlPost(publicacion);
//                    break;
//                }

//            }
//            /*datahtml+=getHtmlPost(publicacion);*/
//        }
//        for(i in semana){
//          if (semanaHtml[i]!='<div class="divisionDiaPerfil">Publicaciones del dia '+semana[i].dia+'</div>') {
//             datahtml+=semanaHtml[i];
//         }

//     }
//     /*images=[
//     {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//     ];*/
//     var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
//     var htmlImages=getHtmlImages(imagen);
//     for(var i in images){
//      htmlImages+=getHtmlImages(images[i]);
//     }

//  perfilFunction(negocioId,negocio,datahtml,directions,htmlImages);



// }
// else{
//   var images=data.datos.images;
//   /*images=[
//   {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//   ];*/
//   var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
//   var htmlImages=getHtmlImages(imagen);

//   for(var i in images){
//      htmlImages+=getHtmlImages(images[i]);
//  }
//  var datahtml='<div class="h50">Sin publicaciones :(';
//  perfilFunction(negocioId,negocio,datahtml,directions,htmlImages);


// }   
// $carousel =$('.owl-carousel');
// $carousel.owlCarousel({
//   items:1,
//   autoHeight:true,
//   responsiveClass:true,
//   lazyLoad:true,
//   loop:true,
//   margin:0
// }).removeClass('owl-hidden');

// ajaxLoader("termina");

// }).fail(function( jqXHR, textStatus, errorThrown ) {
//    var appS = getAppSession();
//    var addresses= appS.addresses;
//    var directions=appS.negocio.directions;
//    var address=appS.negocio.address;
//    var hasAddress=appS.negocio.hasAddress;
//    var datahtml='<div class="h50">Sin publicaciones :(';
//    /*images=[
//    {ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ,{ubication:'https://placehold.it/',name:'350x250&text=1-retina' }
//    ];*/
//    var imagen={ubication:'http://adondeirenlaciudad.com/imagenes_/profPicture/',name:negocio.userpic };
//    var htmlImages=getHtmlImages(imagen);
//    for(var i in images){
//       htmlImages+=getHtmlImages(images[i]);
//   }
//   perfilFunction(negocioId,negocio,datahtml,appS.addresses,getHtmlImages);
//   $carousel =$('.owl-carousel');
//   $carousel.owlCarousel({
//       items:1,
//       autoHeight:true,
//       responsiveClass:true,
//       lazyLoad:true,
//       loop:true,
//       margin:0
//   }).removeClass('owl-hidden');
//   ajaxLoader("termina");
// });



// break;
// }

// }


// }
// else{

// }
// ajaxLoader("termina");

// }).fail(function( jqXHR, textStatus, errorThrown ) {
//                         //
//                         ajaxLoader("termina");
//                     });

//     }






        setTimeout(function ()
        {
            mainFunction();
        }, 3750);


        /* fin inicializar */
    }
    function cambioCategoria(id, icon, name)
    {
        $("html, body").animate({scrollTop: 0}, "slow");
        appS = getAppSession();
        if (id === "0")
        {
            appS.user.categoria = "0";
            appS.user.categoriaNombre = "Inicio";
            appS.user.classIcon = icon;
            setAppSession(appS);
            mainFunction();
            $("#classIcon").html('<img class="h35" src="images/logos/i.png" alt="logo">');
        }
        else
        {
            if (id === "-1")
            {

                appS.user.categoriaNombre = "Inicio";
                appS.user.classIcon = icon;
                setAppSession(appS);
                $("#classIcon").html('<img class="h35" src="images/logos/i.png" alt="logo">');
                window.ga.trackView('Ubicaciones')
                $.mobile.changePage("#ubicaciones");
                ubicacionesFunction();
            }
            else
            {
                window.ga.trackEvent('Categoria', 'Cambio de categoria', name);
                appS.user.categoria = id;
                appS.user.categoriaNombre = name;
                appS.user.classIcon = icon;
                setAppSession(appS);
                mainFunction();
                $("#classIcon").html('<span class="sidebar-icon fa ' + appS.user.classIcon + ' cLightGrey"></span>');
            }
        }
    }
    function openInAppBrowserBlank(url)
    {
        try
        {
            ref = window.open(encodeURI(url), '_blank', 'location=no');
            ref.addEventListener('loadstop', LoadStop);
            ref.addEventListener('exit', Close);
        }
        catch (err)
        {
            alert(err);
        }
    }
    function LoadStop(event)
    {
        if (event.url == "http://www.mypage.com/closeInAppBrowser.html")
        {
            /*alert("fun load stop runs");*/
            ref.close();
        }
    }
    function Close(event)
    {
        ref.removeEventListener('loadstop', LoadStop);
        ref.removeEventListener('exit', Close);
    }

    $(document).on("pageshow", "#ubicaciones", function ()
    {
        /*console.log("show de ubicaciones");*/
        //navigator.geolocation.getCurrentPosition(onSuccess, onError);
        google.maps.event.trigger(map, "resize");

    });
    function ajustarMapa()
    {
        getMapLocation();
        var height = $('#ubicaciones').height();
        $('#map').height((height * 120) / 100);

        google.maps.event.trigger(map, "resize");/*
         console.log("mapa centrado en: ");*/
        /*´*/
    }
    $(window).resize(function (event)
    {
        /* Act on the event */
        var newWidth = $(window).width();
        var newHeight = $(window).height();
        if (newWidth != width || newHeight != height)
        {
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

function getMapLocation()
{

    navigator.geolocation.getCurrentPosition
            (onMapSuccess, onMapError, {enableHighAccuracy: true});
}

// Success callback for get geo coordinates 

var onMapSuccess = function (position)
{

    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;

    getMap(Latitude, Longitude);

}

// Get map by using coordinates 

function getMap(latitude, longitude)
{

    var latLong = new google.maps.LatLng(latitude, longitude);
    var latLng = {lat: latitude, lng: longitude};

    addCenter(latLng);
    centerMap(latLng, 16);/*
     console.log("mapa cargado y centrado en: "+latitude+","+longitude);*/
}

// Success callback for watching your changing position 

var onMapWatchSuccess = function (position)
{

    var updatedLatitude = position.coords.latitude;
    var updatedLongitude = position.coords.longitude;

    if (updatedLatitude != Latitude && updatedLongitude != Longitude)
    {

        Latitude = updatedLatitude;
        Longitude = updatedLongitude;

        getMap(updatedLatitude, updatedLongitude);
    }
}

// Error callback 

function onMapError(error)
{/*
 console.log('code: ' + error.code + '\n' +
 'message: ' + error.message + '\n');*/
}

// Watch your changing position 

function watchMapPosition()
{

    return navigator.geolocation.watchPosition
            (onMapWatchSuccess, onMapError, {enableHighAccuracy: true});
}

//funcion iniciar mapa
function initMap()
{
    var styleArray = [{"featureType": "all", "elementType": "labels", "stylers": [{"visibility": "on"}]}, {"featureType": "administrative", "elementType": "all", "stylers": [{"saturation": "-100"}]}, {"featureType": "administrative.province", "elementType": "all", "stylers": [{"visibility": "off"}]}, {"featureType": "landscape", "elementType": "all", "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]}, {"featureType": "poi", "elementType": "all", "stylers": [{"saturation": -100}, {"lightness": "50"}, {"visibility": "off"}]}, {"featureType": "road", "elementType": "all", "stylers": [{"saturation": "-100"}]}, {"featureType": "road.highway", "elementType": "all", "stylers": [{"visibility": "simplified"}]}, {"featureType": "road.arterial", "elementType": "all", "stylers": [{"lightness": "30"}]}, {"featureType": "road.local", "elementType": "all", "stylers": [{"lightness": "40"}]}, {"featureType": "transit", "elementType": "all", "stylers": [{"saturation": -100}, {"visibility": "simplified"}]}, {"featureType": "water", "elementType": "geometry", "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]}, {"featureType": "water", "elementType": "labels", "stylers": [{"lightness": -25}, {"saturation": -100}]}];

    var mapOptions = {
        center: new google.maps.LatLng(25.5507416, -103.4577724)
        , zoom: 1,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
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
    directionsDisplay.setOptions({suppressMarkers: true});
    /*calculateAndDisplayRoute(directionsService, directionsDisplay);*/

}
function removeRoute()
{
    directionsDisplay.setMap(null);
}
function calculateAndDisplayRoute(directionsService, directionsDisplay)
{
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});
    var selectedMode = 'DRIVING';
    var lat = Latitude;
    var lng = Longitude;
    directionsService.route({
        origin: {lat: lat, lng: lng}, // Haight.
        destination: {lat: 25.5507416, lng: -103.4577724}, // Ocean Beach.
        // Note that Javascript allows us to access the constant
        // using square brackets and a string value as its
        // "property."
        travelMode: google.maps.TravelMode[selectedMode]
    }, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            window.ga.trackEvent('Negocio', 'Calcular ruta');
            directionsDisplay.setDirections(response);
        }
        else
        {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function addMarker(location, label, icon, enlazar)
{
    var marker = new google.maps.Marker({
        position: location,
        icon: icon,
        map: map,
        animation: google.maps.Animation.DROP,
        labelAnchor: new google.maps.Point(300, 100), // Os lo explico después del CSS.
        label: label,
        labelClass: 'labels' // LA CLASE CSS, AQUÍ LLEGA LA MAGIA!!
    });
    markers.push(marker);
    if (enlazar)
    {
        marker.addListener('click', enlazarMarcador);
    }
}
function addCenter(location)
{
    for (var i = 0; i < center.length; i++)
    {
        center[i].setMap(null);
    }
    center = [];
    var marker = new google.maps.Marker({
        position: location,
        icon: "images/png/usted.png",
        map: map,
        animation: google.maps.Animation.DROP,
        labelAnchor: new google.maps.Point(300, 100), // Os lo explico después del CSS.
        label: 'Usted',
        labelClass: 'labels' // LA CLASE CSS, AQUÍ LLEGA LA MAGIA!!
    });
    center.push(marker);

}
function enlazarMarcador(e)
{
    var lat = Latitude;
    var lng = Longitude;
    if (Latitude === "undefined" || Latitude === undefined)
    {
        lat = 25.535769;
        lng = -103.448636;
    }
    var selectedMode = 'DRIVING';
    directionsService.route({
        origin: {lat: lat, lng: lng},
        destination: {lat: e.latLng.lat(), lng: e.latLng.lng()},
        travelMode: google.maps.TravelMode[selectedMode]
    }, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            window.ga.trackEvent('Negocio', 'Calcular ruta');
            directionsDisplay.setDirections(response);
        }
        else
        {
            window.alert('Directions request failed due to ' + status);
        }
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});

}
;
function enlazarMarcadorClick(elat, elng)
{
    var lat = Latitude;
    var lng = Longitude;
    if (Latitude === "undefined" || Latitude === undefined)
    {
        lat = 25.535769;
        lng = -103.448636;
    }
    var selectedMode = 'DRIVING';
    directionsService.route({
        origin: {lat: lat, lng: lng},
        destination: {lat: elat, lng: elng},
        travelMode: google.maps.TravelMode[selectedMode]
    }, function (response, status)
    {
        if (status == google.maps.DirectionsStatus.OK)
        {
            directionsDisplay.setDirections(response);
        }
        else
        {
            window.alert('Directions request failed due to ' + status);
        }
    });
    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});

}
;

function setMapOnAll(map)
{
    for (var i = 0; i < center.length; i++)
    {
        center[i].setMap(map);
    }
    for (var i = 0; i < markers.length; i++)
    {
        markers[i].setMap(map);
    }
}
function centerMap(latLng, z)
{
    map.setCenter(latLng);
    map.setZoom(z);
}

function clearMarkers()
{
    setMapOnAll(null);
}

function showMarkers()
{
    setMapOnAll(map);
}


function deleteMarkers()
{
    clearMarkers();
    markers = [];
    center = [];
    removeRoute();
}
function clearMarkers()
{
    for (var i = 0; i < markers.length; i++)
    {
        markers[i].setMap(null);
    }
    for (var i = 0; i < center.length; i++)
    {
        center[i].setMap(null);
    }
    center = [];
    markers = [];
}
function toggleBounce()
{
    if (marker.getAnimation() !== null)
    {
        marker.setAnimation(null);
    }
    else
    {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}
function getOrigin()
{
    if (Latitude === "undefined" || Latitude === undefined)
    {
        return  '25.535769,-103.448636';
    }

    return Latitude + ',' + Longitude;
}
