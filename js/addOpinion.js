function hideButton() {
  document.getElementById("showForm").style.display = "none";
}

function showButton() {
  const element = document.getElementById("showForm4Phones");
  const displayValue = getComputedStyle(element, null).display;
  if (displayValue === "none") {
    document.getElementById("showForm").style.display = "block";
  }
}

function processMusic(music) {
  let conclusion = "";
  if (music.classic || music.popMusic || music.jazz) {
    conclusion += "Druhy hudby ktorÃ© poÄÃºvam: ";

    if (music.classic) {
      conclusion += "klasika";
    }
    if (music.popMusic) {
      conclusion +=
        conclusion === "Druhy hudby ktorÃ© poÄÃºvam: "
          ? "pop-music"
          : ", pop-music";
    }
    if (music.jazz) {
      conclusion +=
        conclusion === "Druhy hudby ktorÃ© poÄÃºvam: " ? "jazz" : ", jazz";
    }
  }

  return conclusion;
}

function processOpnFrmData(event) {
  event.preventDefault();

  let myFormElm = document.getElementById("formular");
  let elements = myFormElm.elements;

  const nrvName = elements["name"].value.trim();
  const nrvEmail = elements["email"].value.trim();
  const nrvComment = elements["comment"].value.trim();

  if (nrvName === "" || nrvEmail === "" || nrvComment === "") {
    window.alert("Please, enter your name, email and opinion");
    return;
  }

  let nrvRepeatedRecension =
    elements["repeatedRecension"].checked === true
      ? elements["repeatedRecension"].value
      : "TÃºto strÃ¡nku recenzujem po prvÃ½krÃ¡t.";

  let selectedOpt = "";
  const options = elements["change"];
  let i = 0,
    len = options.length;
  for (; i < len; i++) {
    if (options[i].checked === true) {
      selectedOpt = options[i].value;
      break;
    }
  }

  if (selectedOpt === "") {
    nrvRepeatedRecension = "";
  }

  const music = {
    classic: elements["classic"].checked,
    popMusic: elements["popMusic"].checked,
    jazz: elements["jazz"].checked
  };

  const newReview = {
    repeatedRecension: nrvRepeatedRecension,
    change: selectedOpt,
    name: nrvName,
    email:
      "mailto:" +
      nrvEmail +
      "?Subject=Reakcia%20na%20VaÅ¡u%20recenziu%20na%20blog%20s%20nÃ¡zvom%20Musicer",
    music: processMusic(music),
    img: elements["urlImg"].value.trim(),
    keyWords: elements["keywords"].value.trim(),
    comment: nrvComment,
    created: new Date()
  };

  let reviews = [];

  if (localStorage.musicerComments) {
    reviews = JSON.parse(localStorage.musicerComments);
  }

  console.log("NovÃ½ prÃ­spevok:\n " + JSON.stringify(newReview));
  reviews.push(newReview);
  localStorage.musicerComments = JSON.stringify(reviews);

  console.log("PridanÃ½ novÃ½ prÃ­spevok");
  console.log(newReview);

  myReset(myFormElm);

  document.getElementById("showForm").style.display = "block";
  window.location.hash = "#opinions";
}

function myReset(element) {
  element.reset();
  let subQuestionElems = document.getElementsByClassName("subQuestion");
  let i = 0,
    len = subQuestionElems.length;
  for (; i < len; i++) {
    subQuestionElems[i].style.display = "none";
  }
}

let state = 0,
  i,
  len;
let radios;
function multipleClicking(element) {
  if (state === 1) {
    element.checked = false;
    i = 0;
    radios = document.getElementsByName("change");
    len = radios.length;
    for (; i < len; i++) {
      radios[i].checked = false;
    }
    i = 0;
    let subQuestionElems = document.getElementsByClassName("subQuestion");
    len = subQuestionElems.length;
    for (; i < len; i++) {
      subQuestionElems[i].style.display = "none";
    }
  } else {
    i = 0;
    let subQuestionElems = document.getElementsByClassName("subQuestion");
    len = subQuestionElems.length;
    for (; i < len; i++) {
      subQuestionElems[i].style.display = "unset";
    }
  }
  state = (state + 1) % 2;
}
