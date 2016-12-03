
var storage;
var app={};





/*This is called with the results from from FB.getLoginStatus().*/
function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  /* The response object is returned with a status field that lets the*/
  /*app know the current login status of the person.*/
  /*Full docs on the response object can be found in the documentation*/
  /*for FB.getLoginStatus().*/
  if (response.status === 'connected') {
    /*Logged into your app and Facebook.*/

  } else if (response.status === 'not_authorized') {
    /*The person is logged into Facebook, but not your app.*/
    document.getElementById('status').innerHTML = 'Please log ' +
    'into this app.';
  } else {
    /*The person is not logged into Facebook, so we're not sure if*/
    /*they are logged into this app or not.*/
    document.getElementById('status').innerHTML = 'Please log ' +
    'into Facebook.';
  }
}

/*This function is called when someone finishes with the Login*/
/*Button.  See the onlogin handler attached to it in the sample*/
/*code below.*/
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId      : '1749228825402429',
    cookie     : true,  /*// enable cookies to allow the server to access */
    /*the session*/
    xfbml      : true,  /*// parse social plugins on this page*/
    version    : 'v2.8' /*// use graph api version 2.8*/
  });

  /*Now that we've initialized the JavaScript SDK, we call */
  /*FB.getLoginStatus().  This function gets the state of the*/
  /* person visiting this page and can return one of three states to*/
  /* the callback you provide.  They can be:*/
  /*1. Logged into your app ('connected')*/
  /*2. Logged into Facebook, but not your app ('not_authorized')*/
  /*3. Not logged into Facebook and can't tell if they are logged into*/
  /*   your app or not.*/
  /*These three cases are handled in the callback function.*/

  is_fb_login();

};

/*Load the SDK asynchronously*/
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

/* Here we run a very simple test of the Graph API after login is*/
/*successful.  See statusChangeCallback() for when this call is made.*/
function testAPI() {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);

  });
}
function is_fb_login(){
  var app={};
  var facebook={};
  FB.getLoginStatus(function(response) {
    console.log(response);
    
    if (response.status === 'connected') {

      FB.api('/me',{fields: 'name, email'}, function(response) {
        saveStorage(response.name,response.email,'connected');
        
      });

    } 
    else if (response.status === 'not_authorized') {
      saveStorage("","",response.status);
    } 
    else {
      saveStorage("","","undefined");
    }

  });

  
}
function saveStorage(name,email,status){
  var app={};
  var facebook={};
  facebook.name=name;
  facebook.email=email;
  facebook.status=status;
  try {
    if (localStorage.getItem) {
      storage = localStorage;
      storageS = sessionStorage;
    }
  } catch(e) {
    storage = {};
    storageS = {};
  }
  if (storage.app===undefined) {
    var user={
      token:"",
      email:"",
      name:"",
    };
    app={
      user:user
    };
    app.facebook=facebook;
    storage.app=JSON.stringify(app);
  }
  else{
    app=JSON.parse(storage.app);    
    if (app.user===undefined) {
      app.user={
        token:"",
        email:"",
        name:"",
      };
      app.facebook=facebook;
      storage.app=JSON.stringify(app);    
    }
    app.facebook=facebook;
    storage.app=JSON.stringify(app); 
  }
}