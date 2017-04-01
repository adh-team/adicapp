var storage,
storageS,
appL,
appS,
emptyConfig={
	firstTime:true
},
emptyAppL={
	config:emptyConfig
},
emptyAppS={}
;

/* Local storage */
function getAppL(){
	if (storage.appL===undefined || storage.appL==="undefined") {
		appL=emptyAppL;
		setAppL(appL);
	}
	else{
		appL=JSON.parse(storage.appL);
		setAppL(appL);
	}
	return appL;
}
function setAppL(appL){
	storage.appL=JSON.stringify(appL);
}
/* Session storage */
function getAppS(){
	if (storageS.appS===undefined|| storageS.appS === "undefined") {
		appS=emptyAppS;
		setAppS(appS);
	}
	else{
		appS=JSON.parse(storageS.appS);
		setAppS(appS);

	}
	return appS;
}
function setAppS(appS){
	storageS.appS=JSON.stringify(appS);
}
function initStorage(){
	try {
		if (localStorage.getItem) {
			storage = localStorage;
			storageS = sessionStorage;
		}
	} catch(e) {
		storage = {};
		storageS = {};
	}
	getAppL();
	getAppS();
}