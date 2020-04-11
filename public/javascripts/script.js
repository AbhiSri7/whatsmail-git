
//allowing tab key in textarea
var textareas = document.getElementsByTagName('textarea');
var count = textareas.length;
for(var i=0;i<count;i++){
    textareas[i].onkeydown = function(e){
        if(e.keyCode==9 || e.which==9){
            e.preventDefault();
            var s = this.selectionStart;
            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = s+1; 
        }
    }
}


//Useful to disable back button in browser
// window.location.hash="no-back-button";
// window.location.hash="Again-No-back-button";//again because google chrome don't insert first hash into history
// window.onhashchange=function(){window.location.hash="no-back-button";}

var el = document.getElementById('val');

el.addEventListener('submit', function(){
    return confirm("1. Sender mail types supported are gmail, outlook, hotmail and yahoo\n2. You must 'allow less secure apps' in your mail account settings first before using this app.\n3. Go to Account -> Security and `Allow less secure apps` in your mail settings.\n4. You may turn it off after using the app.\n5. Don't Go back or Reload the page until emails are sent.");
}, false);

document.getElementById('create').onclick = function() {
    // this (keyword) refers to form to which onsubmit attached
    // 'ship' is name of radio button group
    var val = document.getElementById("no_emails").value;
    // display value obtained

    document.getElementById("enter").innerHTML = ""

    var i=1;
    for(i=1 ; i <= val; i++)
    {
        document.getElementById("enter").innerHTML += "<label for='rec" + i + "'>Receiver " + i + "'s" + " email:  </label><input type='email' id='rec" + i + "' name='rec" + i + "' required><br><br>";
    }
   
    document.getElementById("enter").innerHTML += "<hr align='left' width='40%'>"
}


// document.getElementById('send').onclick = function() {

//     document.getElementById("result").innerHTML = "";

//     var elms = document.getElementById("enter").getElementsByTagName("input");
//     for(var i=0 ; i < elms.length; i++)
//     {
//         document.getElementById("result").innerHTML += elms[i].id;
//         document.getElementById("result").innerHTML += " : ";
//         document.getElementById("result").innerHTML += elms[i].value;
//         document.getElementById("result").innerHTML += "<br>";
//     }
   
//     document.getElementById("result").innerHTML += "<hr>"    
// }

// document.getElementById('val').onsubmit = function() {
    
//     window.open("../error.html");
// }



