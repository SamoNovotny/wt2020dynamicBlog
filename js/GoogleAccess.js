let auth2 = {};

function signOut() {
    if(auth2.signOut) auth2.signOut();
    if(auth2.disconnect) auth2.disconnect();

}

let clickCounter = 0;
function showInfPanel(){
    if(clickCounter === 0){
        document.getElementById("infPanel").style.display = "block";
    }else{
        document.getElementById("infPanel").style.display = "none";
    }
    clickCounter = (clickCounter + 1)%2;
}


let updateSignIn = function() {
    let sgnd = auth2.isSignedIn.get();
    if (sgnd) {
        document.getElementById("SignInButton").style.display = "none";
        document.getElementById("SignedIn").style.display = "block";
        document.getElementById("initial").style.display = "block";
        document.getElementById("infPanel").style.display = "none";
        document.getElementById("initial").innerHTML="&nbsp&nbsp&nbsp&nbsp" + auth2.currentUser.get().getBasicProfile().getGivenName()[0] + auth2.currentUser.get().getBasicProfile().getFamilyName()[0] + "&nbsp&nbsp&nbsp&nbsp";
        document.getElementById("userName").innerHTML=auth2.currentUser.get().getBasicProfile().getName();
        document.getElementById("userEmail").innerHTML=auth2.currentUser.get().getBasicProfile().getEmail();
    }else{
        document.getElementById("SignInButton").style.display = "block";
        document.getElementById("SignedIn").style.display = "none";
    }

    fillInForm();

};

function fillInForm(){
    let sgnd = auth2.isSignedIn.get();
    let userNameInputElm = document.getElementsByClassName("authors");
    let userEmailInputElm = document.getElementsByClassName("emails");

    if (userNameInputElm.length){// pre/for 82GoogleAccessBetterAddArt.html
        if (sgnd) {
            Array.from(userNameInputElm).forEach(element => element.value = auth2.currentUser.get().getBasicProfile().getName());
        }else{
            Array.from(userNameInputElm).forEach(element => element.value = "");
        }
    }

    if(userEmailInputElm.length){
        if (sgnd) {
            Array.from(userEmailInputElm).forEach(element => element.value = auth2.currentUser.get().getBasicProfile().getEmail());
        }else{
            Array.from(userEmailInputElm).forEach(element => element.value = "");
        }
    }
}

function startGSingIn() {
    gapi.load('auth2', function() {
        gapi.signin2.render('SignInButton', {
            'width': 240,
            'height': 50,
            'longtitle': true,
            'theme': 'dark',
            'onsuccess': onSuccess,
            'onfailure': onFailure
        });
        gapi.auth2.init().then( //zavolat po inicializÄËcii OAuth 2.0  (called after OAuth 2.0 initialisation)
            function (){
                console.log('init');
                auth2 = gapi.auth2.getAuthInstance();
                auth2.isSignedIn.listen(updateSignIn);
                auth2.then(updateSignIn); //tiez po inicializacii (later after initialisation)
            });
    });

}

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}
function onFailure(error) {
    console.log(error);
}