(function(n){
    'use strict';

    // Set up the display of the application.
    var  importFragmentsToDom = () => {
        const links = document.querySelectorAll('link[rel="import"');

        let imports = {
            '#app-header': document.importNode(links[0].import.querySelector('nav'), true),
            '#left-side-nav': document.importNode(links[1].import.querySelector('#sidebar'), true),
            '#app-footer': document.importNode(links[2].import.querySelector('footer'), true)
        };

        Object.keys(imports).forEach(val => {
            document.querySelector(val).appendChild(imports[val]);
        });
    },

    // name of html fragments used to build DOM elements.
    htmlFragments = {
        noConnection: 'no-connection.html',
        permalink: 'permalink.html',
        settings: 'settings.html'
    },

    // Attributes list for DOM objects.
    domAttr = {
        article: {
            setAttr: {
                url: { selector: '.url', attr: 'href'},
                img: { selector: 'img', attr: 'src'},
                facebookBtn: { selector: '.fb-xfbml-parse-ignore', attr: 'href'},
                twitterBtn: { selector: '.twitter-share-button', attr: 'href'},
            },
            setContent: {
                title: 'h2',
                author: 'h5',
                description: '.description',
                time: '.time'
            }
        }
    },

    // Object containing all the DOM actions.
    // Action List:
    // 1. setAttribute.
    // 2. setTextContent.
    // 3. createDomElem.
    // 4. hideDomElem.
    // 5. showDomElem.
    // 6. makeDomObjFromFragments.
    // 7. createArticleDom.
    domActions = {
        changeElemCss: (sElem, sProperty, sVal) => {
            $(sElem).css(sProperty, sVal);
        },

        buildDomElem: (sDom) => {
            let template = document.createElement('template');
            template.innerHTML = sDom;
            let domElem = template.content.firstChild;
            $(domElem).find('.read').remove();
            return domElem;
        },

        // set dom attribute.
        setAttribute: (domElem, sSelector, sAttribute, sValue) => {
            if (!sValue) {
                domElem.querySelector(sSelector).remove();
                return;
            }
            domElem.querySelector(sSelector).setAttribute(sAttribute, sValue);
        },

        // set text content in a DOM element.
        setTextContent: (domElem, sSelector, sContent) => {
            if (!sContent) {
                domElem.querySelector(sSelector).remove();
                return;
            }
            let child = domElem.querySelector(sSelector);
            if (!('textContent' in child)) {
                throw new Error('DOM element has no property text content');
            }
            child.textContent = sContent;
        },

        // create a DOM element of type sElem. e.g. div, span, h1, etc.
        // with id sId and class sClass.
        createDomElem: (sElem, sId, sClass) => {
            let domELem = document.createElement(sElem);
            if (sClass) {
                domELem.setAttribute('class', sClass);
            }

            if (sId) {
                domELem.setAttribute('id', sId);
            }

            return domELem;
        },

        // hide a DOM element using the sSlector.
        hideDomElem: (sSelector) => {
            let domElem = document.querySelector(sSelector);
            domElem.setAttribute('style', 'display:none;');
        },

        showDomElem: (sSelector) => {
            let domElem = document.querySelector(sSelector);
            domElem.setAttribute('style', 'display:block;');
        },

        // Make a new DOM object from the contents of the file
        // given by sFileName. And after creation invoke the callback.
        // Passing the domObj created to the callback.
        // Uses the readFromFragments function in appData module.
        makeDomObjFromFragments: (sFileName, fCallback) => {
            if (typeof sFileName !== 'string') {
            throw new Error('ArgumentError: expected a string as first argument');
            }

            if (typeof fCallback !== 'function') {
                throw new Error('ArgumentError: expected a function as second argument!');
            }

            let domObj;

            // if the DOM object was already created before
            if ('domFragments' in AppData &&
                sFileName in AppData['domFragments']){
                // No need to read file system, just fetch.
                domObj = AppData.domFragments.sFileName;
            } else {
                // Else read the file given by sFileName.
                let domFragment = appDataFromFs.readFromFragments(sFileName);

                // And create a template.
                let template = document.createElement('template');
                template.innerHTML = domFragment;

                // Using the template create a DOM object.
                // And set it to the AppDate obj for later use.
                domObj = template.content.firstChild;

                // Add property domFragments to AppData.
                AppData.domFragments = {};
                AppData.domFragments.sFileName = domObj;
            }

            fCallback.call(null, domObj);
        },

        // Make a DOM object for an article using the oArticle as
        // parameter. After creation invoke the fCallback function
        // by passing the created object as parameter.
        // An oArticle has the following properties:
        //  1. url: url link to the news article.
        //  2. urlToImage: url link to image of the article.
        //  3. title: Title of the article.
        //  4. author: Author of the article.
        //  5. description: Description of the article.
        //  6. publishedAt: Time the article was published.
        createArticleDOM: (oArticle, fCallback) => {
            if (typeof fCallback !== 'function') {
                throw new Error('ArgumentError: expected a function as second argument');
            }

            let attrList = domAttr.article;
            domActions
            .makeDomObjFromFragments(htmlFragments.permalink, (domElem) => {

                let helpers = exposed.helpers;
                let dateTime = new Date(oArticle.publishedAt).toDateString()
                                        .split(' ').splice(1).join(' ');

                domActions // Set attributes for urls in articles.
                .setAttribute(domElem, attrList.setAttr.url.selector,
                            attrList.setAttr.url.attr, oArticle.url);

                domActions // Set attributes for image in articles.
                .setAttribute(domElem, attrList.setAttr.img.selector,
                            attrList.setAttr.img.attr, oArticle['urlToImage']);

                domActions // Set attributes for facebook button.
                .setAttribute(domElem, attrList.setAttr.facebookBtn.selector,
                            attrList.setAttr.facebookBtn.attr,
                            helpers.createFacebokShareUrl(oArticle.url));

                domActions. // Set attributes for twitter button.
                setAttribute(domElem, attrList.setAttr.twitterBtn.selector,
                            attrList.setAttr.twitterBtn.attr,
                            helpers.createTwitterShareUrl(oArticle.url));

                domActions // Set content of the article title.
                .setTextContent(domElem, attrList.setContent.title, oArticle['title']);

                domActions // Set the author of the article.
                .setTextContent(domElem, attrList.setContent.author, oArticle['author']);

                domActions // Set the description of the article.
                .setTextContent(domElem, attrList.setContent.description, oArticle['description']);

                domActions // Set the time of the article.
                .setTextContent(domElem, attrList.setContent.time, dateTime);
                fCallback.call(null, domElem);
            });
        },

        // appendNewArticle: article, element to insert.
        // Put the newly created article dom element in the app
        // body for display. If sContainer is given select that
        // elem for appending else select the default.
        appendNewArticle: (domArticle, sContainer) => {
            sContainer = sContainer || '#newsList';
            domActions.hideDomElem('#loading');
            domActions.hideDomElem('#connection');
            let container = document.querySelector(sContainer);
            container.appendChild(domArticle);
        }
    },

    // Page initialisations.
    init = () => {
        importFragmentsToDom();
        
        // Set the contents of the settings dom Element.
        // set the css according to the save file.

        // Add the DOM actions to global window.exports object.
        // Defined in index.html window variable.
        exposeFunctionsFromFile('domActions', domActions);
    };

    n(() => {
        init(); // initialize the application looks.
    })
})(jQuery);