var onMobile=false;
$( document ).ready(function() {
    console.log( "ready!" );
    init();
});












this.addEventListener("DOMContentLoaded", setupEvents, true);
function onDeviceReady(){
    onMobile=true;
    console.log('ready');  
}

function setupEvents(){
    document.addEventListener("deviceready",onDeviceReady,false);
}

// Callback to fire when login status check ends
function endLoginCheck(status){
  if(status === -1){
    //alert('You are not logged in yet');
    
    // Clear profile name
    //document.getElementById("profile-name").innerHTML = ' ... ';

    // Update anchor behavior to logout
    //var logoutButton = document.getElementById("logout-button");
    //logoutButton.style.display = 'none';
    //var loginButton = document.getElementById("login-button");
    //loginButton.style.display = 'inline';
}else{
    me(status);
}
}

// Start login function
function startLogin(e){
  gl.startSignin(endLogin);
}

// Callback that fires when login process ends
function endLogin(result){
  if(result === -1){
    // Login was not successful :(
        alert('Login error');
    }else{
        // If successful login, use access_token to get profile name
        me(result);
    }
}

// Function to logout
function logout(e){
  gl.logOut();
  
  // Clear profile name
  document.getElementById("profile-name").innerHTML = ' ... ';
            
  // Update anchor behavior to logout
  var logoutButton = document.getElementById("logout-button");
  logoutButton.style.display = 'none';
  var loginButton = document.getElementById("login-button");
  loginButton.style.display = 'inline';
}

function me(accessToken){
        if(accessToken!==null && typeof(accessToken)!=='undefined'){
            var urlAPI = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accessToken;
    
            var xmlreq = new XMLHttpRequest();
            xmlreq.onreadystatechange=function(){
                if (xmlreq.readyState==4 && xmlreq.status==200){
                    var response = eval('(' + xmlreq.responseText + ')');
                    if(response.name){                  
                        // Update profile name
            document.getElementById("profile-name").innerHTML = response.name 
                                  + '<br>Id: ' + response.id;
            
            // Update anchor behavior to logout
            var loginButton = document.getElementById("login-button");
            loginButton.style.display = 'none';
            var logoutButton = document.getElementById("logout-button");
            logoutButton.style.display = 'inline';
                    }
                }
            }   ;
            xmlreq.open("GET",urlAPI,true);
            xmlreq.send();
        }
}


$( document ).on( "mobileinit", function() {
    $.extend( $.mobile , {
        defaultPageTransition: 'vanishIn'
    });
    console.log('ready');
});

    function init(){
        openFB.init({appId: 'a4fb9c07d5b3c21d112da7a6e28f7b72'});

        initStorage();
        var firstTime=appL.config.firstTime;
        if (firstTime===false) {
            firstTime=undefined;
        }
        var app = new Vue({
          el: '#index',
          data: {
            firstTime: firstTime,
            user:null,
            pass:null,
            token:undefined,
            fbToken:undefined,
            glToken:undefined,
            user:null,
            lostPasswordForm:undefined,
            gl:null,

        },
        created:function(){
            this.initMethod();
        },
        computed:{
            login: function(){
                var login={
                    user:this.user,
                    pass:this.pass
                }
                return login;
            }
        },
        methods:{
            initMethod: function(){
                console.log('ready');
                /* verificar si esta logueado */
                if (this.token!==undefined || this.fbToken!==undefined || this.glToken !== undefined ){
                    console.log('logged');
                } else {
                    console.log('no is logged');
                    if(this.firstTime){
                        console.log('mostrar modal');
                    }
                }
            },
            disableFirstModal: function (){
                this.firstTime=false;

            },
            changePage:function(route,transition){
                if(transition===undefined){transition='vanishIn'}
                    $.mobile.changePage( '#'+route, { transition:transition, changeHash: false });
            },
            fbLogin:function(){
                openFB.login(
                    function(response) {
                        if(response.status === 'connected') {
                            console.log(response);
                            app.fbToken= response.authResponse.accessToken;
                            /* mandar a verificacion el id de facebook para ver si ay un unsuario registrado con ese id*/
                            var checkId={
                                checked:true,
                                exist:true,
                            }/*hardcode*/
                            if(checkId.checked){
                                console.log('usuario logueado y verificado con facebook');
                            }else{
                                /* puede ser por 2 razones por que el usuario existe pero no esta linqueado a facebook */
                            /* o porque el usuario no existe en este caso se registra un usuario automaticamente 
                             y te llega la contraseña por correo tambien se puede incluir un mensaje que le diga su
                             contraseña en vivo y por ultimo loguear */
                             console.log('el usuario no esta verificado');
                             if(checkId.exist){
                                console.log('el usuario no tiene configurado el inicio de sesion con fb');

                            }else{
                                console.log('se registrara el usuario con la informacion de facebook');
                                /* funcion de registro y login */
                            }
                        }
                        app.getInfo();
                        /*app.readPermissions();*/
                    } else {
                     app.errorHandler(response.error);
                 }
             }, {scope: 'public_profile,email'});

            },
            getInfo:function(){
                openFB.api({
                    path: '/me',
                    params:{
                        fields:'email, name',
                    },

                    success: function(data) {
                    console.log(JSON.stringify(data));/*
                    document.getElementById("userName").innerHTML = data.name;
                    document.getElementById("userPic").src = 'http://graph.facebook.com/' + data.id + '/picture?type=small';*/
                },
                error: errorHandler});
            },
            readPermissions:function(){
                openFB.api({
                    method: 'GET',
                    path: '/me/permissions',
                    success: function(result) {
                        alert(JSON.stringify(result.data));
                    },
                    error: errorHandler
                });
            },
            errorHandler:function(error){
                alert(error);
            },
            saveApp: function(){
                var json={
                    config:{
                        firstTime:this.firstTime,
                    }
                };
                setAppL(json);
            },
            googleLogin: function(){
                startLogin();
            },
            openLostPass: function(){
                this.lostPasswordForm=true;
            },
            disableModalBox: function(e){
                this.lostPasswordForm=false;
            },
            onSubmitLogin: function(){
                console.log(this.login);
                /* peticion ajax */
                /* loguear o arrojar error */
                if(this.login.user==='demo' && this.login.pass==='1234'){
                    console.log('login');
                    this.changePage('main');
                } else {
                    this.errorHandler('Intente de nuevo');
                }
            },
            onSubmitRegister: function(){
                console.log('submit');
            },
            onSubmitLostPass: function(){
                if(this.user==='admin@correo.com'){
                    console.log('Se le enviara un correo a la cuenta favor de seguir las instrucciones que vienen en el');
                    this.disableModalBox();
                } else {
                    this.errorHandler('No tenemos ningun usuario registrado con ese correo');
                }
            },
        },
        watch:{
            firstTime:function(){
                this.saveApp();
            },
            fbToken:function(){
                console.log(this.fbToken);
            }
        },
        components:{
            uiModal:{
                props:['firstTime'],
                methods:{
                    disable:function(){
                        app.disableFirstModal();                
                    },
                },
                template:`<div class="modal" :class="{ 'is-active': firstTime, 'isFlex magictime vanishOut': firstTime === false }">
                <div class="modal-background" @click="disable"></div>
                <div class="modal-content">
                <slot></slot>
                <a class="button w80 noRad is-primary btn-modal magictime puffIn" @click="disable">
                <span>CONTINUAR</span>
                </a>
                </div>
                </div>
                </div>`
            },
            uiModalBox:{
                props:['modalbox'],
                methods:{
                    disableModal:function(){
                        app.disableModalBox();
                    },
                },
                template:`<div class="modal" :class="{ 'is-active': modalbox, 'isFlex magictime vanishOut': modalbox === false }">
                <div class="modal-background" @click="disableModal"></div>
                <div class="modal-content">
                <slot></slot>
                </div>
                </div>
                </div>`
            }
        }
    });
}
 var panel = '<div data-theme="a" data-role="panel" data-display="overlay" id="leftpanel"><ul data-role="listview"><li data-icon="false"><a data-ajax="false" href="index.html">Home</a></li><li data-icon="false"><a data-ajax="false" href="html/examples.html">Examples</a></li><li data-icon="false"><a data-ajax="false" href="html/custom/version.html">Version 1.0.1</a></li></ul></div>';

$(function () {
    $("body").prepend(panel);
    $("[data-role=panel]").panel().enhanceWithin();
});

function changeNavTab(left) {
    var $tabs = $("div[data-role=navbar] li a", $("div[data-role=page].ui-page-active"));
    var curidx = $tabs.closest("a.ui-btn-active").parent().index();
    var nextidx = 0;
    if (left) {
        nextidx = (curidx == $tabs.length - 1) ? 0 : curidx + 1;
    } else {
        nextidx = (curidx == 0) ? $tabs.length - 1 : curidx - 1;
    }
    $tabs.eq(nextidx).click();
}

$("div[data-role=content]").on("swipeleft", function (event) {
    changeNavTab(true);
});
$("div[data-role=content]").on("swiperight", function (event) {
    changeNavTab(false);
});


// Navigation  Drawer Swipe Listener
$("div[data-role=header]").on("swipeleft swiperight", function (e) {
    // save swipe direction right/left
    var dir = 'prev';
    if (e.type == 'swiperight') {
        dir = 'next';
    }
    if (dir == 'prev') {
        $('#leftpanel').panel('close');

    } else {
        $('#leftpanel').panel('open');

    }
});