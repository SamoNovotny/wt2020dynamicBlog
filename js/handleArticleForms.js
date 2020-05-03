import { render } from "mustache";

//Pridanie funkcionality pre kliknutie na tlacidlo "Upload image"
function showFileUpload() {
  Array.from(document.getElementsByClassName("fsetFileUpload")).forEach(
    function(elm) {
      elm.style.display = "block";
    }
  );
  Array.from(document.getElementsByClassName("btShowFileUpload")).forEach(
    function(elm) {
      elm.style.display = "none";
    }
  );
}

//Pridanie funkcionality pre kliknutie na tlacidlo "Cancel uploading"
function cancelFileUpload() {
  Array.from(document.getElementsByClassName("fsetFileUpload")).forEach(
    function(elm) {
      elm.style.display = "none";
    }
  );
  Array.from(document.getElementsByClassName("btShowFileUpload")).forEach(
    function(elm) {
      elm.style.display = "block";
    }
  );
}

/**
 * Uploads an image to the server
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.
 */
function uploadImg(serverUrl) {
  const files = document.getElementById("flElm").files;

  if (files.length > 0) {
    const imgLinkElement = document.getElementById("imageLink");
    const fieldsetElement = Array.from(
      document.getElementsByClassName("fsetFileUpload")
    );
    const btShowFileUploadElement = Array.from(
      document.getElementsByClassName("btShowFileUpload")
    );

    //1. Gather  the image file data

    let imgData = new FormData();
    imgData.append("file", files[0]);

    //2. Set up the request

    const postReqSettings =
      //an object wih settings of the request
      {
        method: "POST",
        body: imgData
      };

    //3. Execute the request

    fetch(`${serverUrl}/fileUpload`, postReqSettings)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(
            new Error(
              `Server answered with ${response.status}: ${response.statusText}.`
            )
          );
        }
      })
      .then(responseJSON => {
        imgLinkElement.value = responseJSON.fullFileUrl;
        btShowFileUploadElement.forEach(function(elm) {
          elm.style.display = "block";
        });
        fieldsetElement.forEach(function(elm) {
          elm.style.display = "none";
        });
      })
      .catch(error => {
        ////here we process all the failed promises
        window.alert(`Image uploading failed. ${error}.`);
      });
  } else {
    window.alert("Please, choose an image file.");
  }
}

/**
 * Process form data and sends the article to server
 * @param event - event objet, to prevent default processing
 * @param articleId - id of the article to be updated
 * @param current - number of page of articles to which the user should return after processing of form, which is used for editing of article
 * @param totalPages - total number of pages of articles on the client side
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.

 */
function processArtEditFrmData(
  event,
  articleId,
  current,
  totalPages,
  serverUrl
) {
  event.preventDefault();

  //1. Gather and check the form data

  const articleData = {
    title: document.getElementById("title").value.trim(),
    content: document.getElementById("content").value.trim(),
    author: document.getElementById("author").value.trim(),

    imageLink: document.getElementById("imageLink").value.trim(),
    tags: "MusicerNovotny," + document.getElementById("tags").value.trim()
  };

  if (!(articleData.title && articleData.content)) {
    window.alert("ProsÃ­m zadajte titulok a obsah ÄlÃ¡nku");
    return;
  }

  if (!articleData.author) {
    articleData.author = "Anonymous";
  }

  if (!articleData.imageLink) {
    delete articleData.imageLink;
  }

  if (!articleData.tags) {
    delete articleData.tags;
  } else {
    articleData.tags = articleData.tags.split(",");
    articleData.tags = articleData.tags.map(tag => tag.trim());
    articleData.tags = articleData.tags.filter(tag => tag);
    if (articleData.tags.length === 0) {
      delete articleData.tags;
    }
  }

  //2. Set up the request

  const postReqSettings =
    //an object wih settings of the request
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(articleData)
    };

  //3. Execute the request

  fetch(`${serverUrl}/article/${articleId}`, postReqSettings)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        ); //we return a rejected promise to be catched later
      }
    })
    .then(responseJSON => {
      window.alert("ObnovenÃ½ ÄlÃ¡nok bol ÃºspeÅ¡ne uloÅ¾enÃ½ na server");
    })
    .catch(error => {
      window.alert(`ObnovenÃ½ ÄlÃ¡nok nebol uloÅ¾enÃ½ na server. ${error}`);
    })
    .finally(
      () =>
        (window.location.hash = `#article/${articleId}/${current}/${totalPages}`)
    );
}

function insertArticle(event, serverUrl) {
  //1. Gather and check the form data

  event.preventDefault();

  let myFormElm = document.getElementById("articleForm");
  let elements = myFormElm.elements;

  const articleData = {
    title: elements["title"].value.trim(),
    content: elements["content"].value.trim(),
    author: elements["author"].value.trim(),
    imageLink: elements["imageLink"].value.trim(),
    tags: "MusicerNovotny," + elements["tags"].value.trim()
  };

  if (!(articleData.title && articleData.content)) {
    window.alert("ProsÃ­m zadajte titulok a obsah ÄlÃ¡nku");
    return;
  }

  if (!articleData.author) {
    articleData.author = "Anonymous";
  }

  if (!articleData.imageLink) {
    delete articleData.imageLink;
  }

  if (!articleData.tags) {
    delete articleData.tags;
  } else {
    articleData.tags = articleData.tags.split(",");
    articleData.tags = articleData.tags.map(tag => tag.trim());
    articleData.tags = articleData.tags.filter(tag => tag);
    if (articleData.tags.length == 0) {
      delete articleData.tags;
    }
  }

  //2. Set up the request

  const postReqSettings =
    //an object wih settings of the request
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(articleData)
    };

  //3. Execute the request

  fetch(`${serverUrl}/article`, postReqSettings)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(responseJSON => {
      window.alert("ÄlÃ¡nok bol ÃºspeÅ¡ne uloÅ¾enÃ½ na server");
    })
    .catch(error => {
      window.alert(`ÄlÃ¡nok nebol uloÅ¾enÃ½ na server. ${error}`);
    })
    .finally(() => (window.location.hash = "#articles/0/-1"));
}

function showCommentForm(articleId, artCurrent, artTotalPages) {
  const args = {
    articleId: articleId,
    artCurrent: artCurrent,
    artTotalPages: artTotalPages
  };
  console.log(args);

  document.getElementById("router-view").innerHTML += render(
    document.getElementById("template-comment-form").innerHTML,
    args
  );
  document.getElementById("addComment").style.display = "none";
  fillInForm();
}

function processCommentForm(event, articleId, artCurrent, artTotalPages) {
  event.preventDefault();

  const elements = document.getElementById("commForm").elements;

  const newComment = {
    text: elements["commElm"].value.trim(),
    author: elements["authorElm"].value.trim()
  };

  const postReqSettings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify(newComment)
  };

  const url = `https://wt.kpi.fei.tuke.sk/api/article/${articleId}/comment`;

  fetch(url, postReqSettings)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(responseJSON => {
      console.log("KomentÃ¡r bol ÃºspeÅ¡ne pridanÃ½ k ÄlÃ¡nku");
    })
    .catch(error => {
      window.alert(
        `BohuÅ¾iaÄ¾, komentÃ¡r sa nepodarilo pridaÅ¥ k ÄlÃ¡nku. ${error}`
      );
    })
    .finally(
      () =>
        (window.location.hash = `#article/${articleId}/${artCurrent}/${artTotalPages}`)
    );
}
