//-----------------------------------------------------------------------------------------------------
//Logo functionality

window.addEventListener("scroll",scrolling);

function scrolling(){

    const target1 = document.getElementById("logo");
    const target2 = document.getElementById("menu");
    const element = document.getElementById("empty");
    const y = element.offsetHeight + element.offsetTop;

    if(window.pageYOffset >= y){
        target1.style.visibility = "visible";
        target2.style.width = "auto";
    }else if(window.pageYOffset < y){
        target1.style.visibility = "hidden";
        target1.style.display = "70vw";
    }
}
//-----------------------------------------------------------------------------------------------------




