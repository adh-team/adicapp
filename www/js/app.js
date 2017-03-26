    $(document).ready(function() {
        init();
    });
    function init(){
        var firstTime=true;
        var app = new Vue({
      el: '#login_form',
      data: {
        firstTime:firstTime,
        user:null,
        pass:null
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
            template:`<div class="modal" :class="{ 'is-active': firstTime, 'is-active animated flipOutY': !firstTime}">
                <div class="modal-background" @click="disable"></div>
                    <div class="modal-content">
                        <slot></slot>
                        <a class="button w80 noRad is-primary btn-modal animated zoomIn" @click="disable">
                            <span>CONTINUAR</span>
                        </a>
                    </div>
                </div>
            </div>`
        }
      }
    });
    }