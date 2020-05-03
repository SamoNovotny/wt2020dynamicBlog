import { render } from "mustache";

export default[

    {
        hash:"welcome",
        target:"router-view",
        getTemplate:(targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML
    },

    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },

    {
        hash:"opinions",
        target:"router-view",
        getTemplate: reviewArray2HTML
    },

    {
        hash:"addOpinion",
        target:"router-view",
        getTemplate: (targetElm) =>
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML
    },

    {
        hash:"article",
        target:"router-view",
        getTemplate: fetchAndDisplayArticleDetail
    },

    {
        hash:"artEdit",
        target:"router-view",
        getTemplate: editArticle
    },

    {
        hash:"artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    },

    {
        hash:"artInsert",
        target:"router-view",
        getTemplate: showInsertArticleForm
    },

    {
        hash:"artComment",
        target:"reviews",
        getTemplate: fetchAndDisplayComments
    }


];

function review2HTML(review){

    const viewer ={
        name: review.name,
        email: review.email,
        createdDate: (new Date(review.created)).toDateString(),
        keyWords: (review.keyWords==="")? "" : "KÄ¾ÃºÄovÃ© slovÃ¡: " + review.keyWords,
        introduction: review.repeatedRecension,
        change: review.change,
        comment: review.comment,
        img: review.img,
        music: review.music
    };

    const template = document.getElementById("template-opinions").innerHTML;
    return render(template,viewer);

}

function reviewArray2HTML(targetElm){

    const sourceData = localStorage.musicerComments;
    let reviews = [];
    reviews=JSON.parse(sourceData);
    let HTMLWithReviews="";
    for(const rvw of reviews){
        HTMLWithReviews += review2HTML(rvw);
    }
    if(HTMLWithReviews === ""){
        HTMLWithReviews = "<p id='noComment'>K tejto strÃ¡nke nie sÃº Å¾iadne komentÃ¡re...</p>";
    }else {
        HTMLWithReviews = "<div id='reviews'>" + HTMLWithReviews +
            "<br><button id='delete' type='button'>ZmazaÅ¥</button><span id='prompt'>Po kliknutÃ­ budÃº odstrÃ¡nenÃ© vÅ¡etky recenzie starÅ¡ie ako jeden deÅ</span></div>";
    }
    document.getElementById(targetElm).innerHTML = HTMLWithReviews;
    document.getElementById("delete").addEventListener("click",deleteOldReviews);

}

function deleteOldReviews(){
    const sourceData = localStorage.musicerComments;
    let reviews = [];
    reviews=JSON.parse(sourceData);

    if(reviews.length !== 0) {
        let tmp;
        let i = 0, len = reviews.length;
        for (; i < len; i++) {
            tmp = reviews.shift();
            if ((Date.now() - new Date(tmp.created)) <= 86400000) {
                reviews.push(tmp);
            }
        }
        localStorage.musicerComments = JSON.stringify(reviews);
        window.location.hash = "#welcome";
        window.location.hash = "#opinions";
    }
}

let articleList = [];
let maxArticlesCount = 5; // should be 20...............................
let oldCurrent = 1;

const urlBase = "https://wt.kpi.fei.tuke.sk/api";

function fetchAndDisplayArticles(targetElm,current,totalPages){

    current = (totalPages==="-1") ? oldCurrent : current;
    oldCurrent = current;

    fetch(`${urlBase}/article/?tag=MusicerNovotny&max=${maxArticlesCount}&offset=${(current-1)*maxArticlesCount}`)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            articleList = responseJSON.articles;
            totalPages = Math.ceil(responseJSON.meta.totalCount / maxArticlesCount);
            window.location.hash = `#articles/${current}/${totalPages}`;
            return Promise.resolve();
        })
        .then( ()=>{
            let cntRequests = articleList.map(
                article => fetch(`${urlBase}/article/${article.id}`)
            );
            return Promise.all(cntRequests)
        })
        .then(responses =>{
            let failed="";
            for(let response of responses) {
                if(!response.ok) failed+=response.url+" ";
            }
            if(failed===""){
                return responses;
            }else{
                return Promise.reject(new Error(`Failed to access the content of the articles with urls ${failed}.`));
            }
        })
        .then(responses => Promise.all(responses.map(resp => resp.json())))
        .then(articles => {
            articles.forEach((article,index) =>{
                articleList[index].content=article.content;
            });
            return Promise.resolve();
        }).then( () =>{
            articleList = makeArticlesData(articleList, totalPages);
            renderArticles(articleList,targetElm, current, totalPages);
        })
        .catch (error => errorHandler && errorHandler(error,targetElm));

}

function errorHandler(error,targetElm) {

    document.getElementById(targetElm).innerHTML=
        "<div id='articles'>" +
        `Error reading data from the server. ${error}` +
        "</div>";
}

function renderArticles(articles,targetElm, current, totalPages) {
    document.getElementById(targetElm).innerHTML=
        "<div id='articles'>" +
        render(
            document.getElementById("template-articles").innerHTML,
            articles
        ) +
        renderArticlesNav(current, totalPages) +
        "</div>";
}

function renderArticlesNav(current, totalPages){
    const cur = parseInt(current);
    const tot = parseInt(totalPages);
    const navArguments = {
        prevPage: (cur-1 > 0) ? (cur-1) : null,
        nextPage: (cur+1 <= tot) ? (cur+1) : null,
        totalPages: tot
    };
    return render(
                    document.getElementById("template-article-nav").innerHTML,
                    navArguments
           );
}

function makeArticlesData(articleList, totalPages) {
    return articleList.map(
                article =>(
                    {
                        ...article,
                        detailLink:`#article/${article.id}/${oldCurrent}/${totalPages}`
                    }
                )
           );
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, current, totalPages) {
    fetchAndProcessArticle(...arguments,false);
}

function editArticle(targetElm, artIdFromHash, current, totalPages) {
    fetchAndProcessArticle(...arguments,true);
}


function fetchAndProcessArticle(targetElm, artIdFromHash, current, totalPages,forEdit) {
    const url = `${urlBase}/article/${artIdFromHash}`;
    let comments = [];

    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{ //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {

            responseJSON.tags = responseJSON.tags.filter(tag => tag!=="MusicerNovotny");
            if(forEdit){
                responseJSON.formTitle="EDITOVANIE ÄLÃNKU";
                responseJSON.formSubmitCall =
                    `processArtEditFrmData(event,${artIdFromHash},${current},${totalPages},'${urlBase}')`;
                responseJSON.submitBtTitle="Save article";
                responseJSON.urlBase=urlBase;
                responseJSON.backLink=`#article/${artIdFromHash}/${current}/${totalPages}`;

                document.getElementById(targetElm).innerHTML =
                    "<article id='fillin'>" +
                    render(
                        document.getElementById("template-article-form").innerHTML,
                        responseJSON
                    ) +
                    "</article>";
                document.getElementById("author").className = "";

            }else{

                responseJSON.backLink=`#articles/${current}/${totalPages}`;
                responseJSON.editLink=`#artEdit/${responseJSON.id}/${current}/${totalPages}`;
                responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${current}/${totalPages}`;

                document.getElementById(targetElm).innerHTML =
                    "<div id='articles'>" +
                    render(
                        document.getElementById("template-article").innerHTML,
                        responseJSON
                    ) +
                    "</div>" +
                    "<div id='reviews'>" +
                    "</div>";
                return responseJSON;
            }

        })
        .catch (error => {
            const errMsgObj = {errMessage:error};
            document.getElementById(targetElm).innerHTML =
                render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        })
        .finally(() => window.location.hash=`#artComment/1/-1/${artIdFromHash}/${current}/${totalPages}`);

}


function renderCommentsNav(articleId, current, totalPages, artCurrent, artTotalPages){
    const cur = parseInt(current);
    const tot = parseInt(totalPages);
    const navArguments = {
        articleId: articleId,
        prevPage: (cur-1 > 0) ? (cur-1) : null,
        nextPage: (cur+1 <= tot) ? (cur+1) : null,
        totalPages: tot,
        artCurrent: artCurrent,
        artTotalPages: artTotalPages
    };

    return render(
        document.getElementById("template-comment-nav").innerHTML,
        navArguments
    );
}

let comments = [];
let maxCommentCount = 10;

function fetchAndDisplayComments(targetElm, current, totalPages, articleId, artCurrent, artTotalPages){

    const url = `${urlBase}/article/${articleId}/comment/?max=${maxCommentCount}&offset=${(current - 1) * maxCommentCount}`;

    fetch(url)
        .then(response =>{
            if(response.ok){
                return response.json();
            }else{
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
            }
        })
        .then(responseJSON => {
            comments = responseJSON.comments;
            console.log(responseJSON.meta.totalCount);
            console.log(comments);
            totalPages = Math.ceil(responseJSON.meta.totalCount / maxCommentCount);
            window.location.hash = `#artComment/${current}/${totalPages}/${articleId}/${artCurrent}/${artTotalPages}`;
            return comments;
        })
        .then(comments =>{
            document.getElementById(targetElm).innerHTML =
                render(
                    document.getElementById("template-comments").innerHTML,
                    comments
                ) +
                renderCommentsNav(articleId, current, totalPages, artCurrent, artTotalPages);
        })
        .catch(error => {
            const errMsgObj = {errMessage:error};
            console.log(errMsgObj);
        });

}

function deleteArticle(targetElm, artIdFromHash, current, totalPages){
    if(window.confirm("SkutoÄne si Å¾elÃ¡te vymazaÅ¥ ÄlÃ¡nok aj s jeho komentÃ¡rmi?")) {
        const url = `${urlBase}/article/${artIdFromHash}`;

        const deleteReqSettings = //an object wih settings of the request
            {
                method: 'DELETE',
            };

        fetch(url, deleteReqSettings)
            .then(response => {
                if (response.ok) {
                    return response;
                } else {
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                }
            })
            .then(() => {
                window.location.hash = `#articles/${current}/${totalPages}`
            })
            .catch(error => {
                window.alert(`ÄlÃ¡nok s komentÃ¡rmi sa nepodarilo zmazaÅ¥ zo servera. ${error}`);

            })
    }

}

function showInsertArticleForm(targetElm){

    const data4InsertForm = {
        formTitle: "PRIDÃVANIE ÄLÃNKU",
        formSubmitCall: `insertArticle(event,'${urlBase}')`,
        submitBtTitle: "Insert article",
        urlBase: urlBase
    }

    document.getElementById(targetElm).innerHTML =
        "<article id='fillin'>" +
        render(
            document.getElementById("template-article-form").innerHTML,
            data4InsertForm
        ) +
        "</article>";
    document.getElementById("author").className = "authors";
}



