// webContents.js: Diploma project
// The Module contains all the Logic regarding network, building of
// dom elements and their display in the BrowserWindow.
// To keep the global name space clean all the tasks are performed inside
// closure.


(function (n) {
    'use strict';

    var constants = {
        // The api key for retrieving news from newsapi.org
        apiKey : 'e57b1ad3b323451a837833635a393343',

        // Object containing the list of urls.
        urls : {
            server: 'https://newsapi.org/v1',
            sources: 'https://newsapi.org/v1/sources',
            articles: 'https://newsapi.org/v1/articles',
            facebookShare: 'https://www.facebook.com/sharer/sharer.php',
            twitterShare: 'https://twitter.com/share'
        }
    },

    // Collection of helper functions for the module.
    helpers = {

        // get all the news sources from a particular category
        // in the AppData['sources'] global Object.
        // Invoke the fCallback function after retrieving the sources.
        getSourcesByCategory: (sCategory, fCallback) => {
            if (typeof sCategory !== 'string') {
                throw new Error('ArgumentError: expected a string as first argument.');
            }
            if (typeof fCallback !== 'function') {
                throw new Error('ArgumentError: expected a function a second argument.');
            }
            if ('sources' in AppData) {
                fCallback.call(null, AppData.sources[sCategory]);
            } else {
                customNetRequest.initializeSources((oSources) => {
                    if (oSources) {
                        fCallback.call(null, oSources.sCategory);
                    } else {
                        fCallback.call(null, null);
                    }
                });
            }
        },

        // get all the categories of news by searching in AppData
        getCategories: () => {
            if ('sources' in AppData) {
                return Object.keys(AppData.sources);
            }
        },

        // check if sources is loaded.
        isSourcesLoaded: () => {
            if ('sources' in AppData) {
                return true;
            }
            return false;
        },

        // Construct url for each the source given by sSource.
        createUrlForArticles: (sSource, sSortBy) => {
            if (typeof sSource !== 'string' || typeof sSortBy !== 'string') {
                throw new Error('ArgumentError: expected a string argument!');
            }
            return constants.urls.articles
                    + '?source=' + sSource
                    + '&sortBy=' + sSortBy
                    + '&apiKey=' + constants.apiKey;
        },

        // create url for sharing on facebook.
        createFacebokShareUrl: (sUrl) => {
            return constants.urls.facebookShare
                    + '?u=' + sUrl + '%2F&amp;src=sdkpreparse';
        },

        // create url for sharing on twitter.
        createTwitterShareUrl: (sUrl) => {
            return constants.urls.twitterShare
                    + '?=size=1&url=' + sUrl;
        }
    },

    customNetRequest =  {
        ajaxGetRequest: (sUrl, fCallback) => {
            //helpers.showDomElem('#loading');
            return $.get(sUrl).done((data) => {
                //helpers.showDomElem('#connection');
                //helpers.hideDomElem('#loading');
                fCallback.call(null, true, data);
            }).fail(() => {
                
                //helpers.hideDomElem('#loading');
                //helpers.showDomElem('#connection');
                fCallback.call(null, false, null);
            });
        },

        // Initialize the sources object.
        // Each time it is called, the window.AppData.sources
        // will be refreshed with the fresh values.
        // The list of sources fetched will be passed as argument
        // to the callback.
        initializeSources: (fCallback) => {
            if (typeof fCallback !== 'function' && typeof fCallback !== undefined) {
                throw new Error('ArgumentError: expected a function');
                
            }
            customNetRequest.ajaxGetRequest(constants.urls.sources,
                (success, data) => {
                    if (!success) {
                       
                 //exposed.domActions.showDomElem('#connection');
                        //fCallback.call(null, success);
                        exposed.domActions.hideDomElem('#loading');
                        exposed.domActions.showDomElem('#connection');
                        return;
                    }
                    let oSources = {};
                    for (let oSource of data.sources) {
                        if (oSource.language !== 'en') {
                            continue;
                        }
                        if (!(oSource.category in oSources)) {
                            oSources[oSource.category] = [];
                        }
                        delete oSource.urlToLogos;
                        delete oSource.url;
                        oSources[oSource.category].push(oSource);
                    }
                    AppData['sources'] = oSources;
                    if (typeof fCallback === 'function') {
                        fCallback.call(null, oSources);
                        
                    }
            });
        },

        // Fetch all the articles belonging to a particular category.
        // i.e., the articles belonging to sCategory and sorted by sSortBy.
        // After the fetching is complete invoke the fCallback.
        fetchArticlesFromCategory: (sCategory, fCallback) => {
            if (typeof sCategory !== 'string'
                || typeof fCallback !== 'function') {
                throw new Error('ArgumentError: expected a string and a function');
               
            }
             
            exposed.domActions.showDomElem('#loading');
             exposed.domActions.hideDomElem('#connection');
            
            let sortOrder = AppData.appSettings.sortOrder || 'top';
            
            if (sCategory === 'science-and-nature') {
                sortOrder = 'top';
            }
            // Get the sources belonging to the category.
            helpers.getSourcesByCategory(sCategory, (oSources) => {
                if (oSources) {
                    // Remove all the old articles.
                    $('#newsList > li').remove();
                    $('#newsList').attr('style', 'display: block;');
                    for (let s of oSources) {
                        customNetRequest
                        .ajaxGetRequest(
                            helpers.createUrlForArticles(s.id, sortOrder),
                            (success, oData) => {
                                if (success) {
                                    fCallback.call(null, oData);
                                    
                                } else {
                                  if (!('#newsList > li').length) {
                                     exposed.domActions.hideDomElem('#loading');
                                     exposed.domActions.showDomElem('#connection'); 
                                  }  
                                }
                            });
                    }
                } else {
                    $('#app-content').remove('li');
                    exposed.domActions.hideDomElem('#loading');
                    exposed.domActions.showDomElem('#connection');
                }
            });
        }
    },

    init = () => {
        // Expose the neccessary functions from this module.
        exposeFunctionsFromFile('helpers', helpers);
        exposeFunctionsFromFile('customNetRequest', customNetRequest);

        var domActions = exposed.domActions;
       domActions.showDomElem('#loading');
        
        
        // Initialize the source object, and after that fetch all
        // the articles from the general category.
        customNetRequest.initializeSources((oSources) => {
            customNetRequest
            .fetchArticlesFromCategory('general', (oData) => {
                oData.articles.forEach((oArticle)=> {
                    domActions.createArticleDOM(oArticle, (domElem) => {
                        domActions.appendNewArticle(domElem)
                    })
                });
            });
        });
    };

    n(() => {
        init();
    });

})(jQuery);