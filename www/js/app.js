$(document).ready(function() {
	init();
});
function init(){
	var app = new Vue({
  el: '#login_form',
  data: {
    user:null,
    pass:null
  }
});
}