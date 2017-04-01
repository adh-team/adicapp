    $(document).ready(function() {
        init();
    });
    function init(){
        initStorage();
        var firstTime=appL.config.firstTime;
        if (firstTime===false) {
            firstTime=undefined;
        }
        var app = new Vue({
          el: '#login_form',
          data: {
            firstTime: firstTime,
            user:null,
            pass:null,
            fbToken:null,
            user:null,
            lostPasswordForm:undefined,

        },
        created:function(){
            this.initMethod();
        },
        methods:{
            initMethod: function(){
                console.log('ready');
                if(this.firstTime){
                    console.log('mostrar modal');
                }
            },
            disableFirstModal: function (){
                this.firstTime=false;

            },
            changePage:function(route,transition){
                if(transition===undefined){transition='flipInY'}
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
            openLostPass: function(){
                this.lostPasswordForm=true;
            },
            disableModalBox: function(e){
                this.lostPasswordForm=false;
            }
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
                template:`<div class="modal" :class="{ 'is-active': firstTime, 'is-active magictime vanishOut': firstTime === false }">
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
                template:`<div class="modal" :class="{ 'is-active': modalbox, 'is-active magictime vanishOut': modalbox === false }">
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