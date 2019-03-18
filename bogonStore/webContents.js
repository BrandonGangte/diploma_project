'use strict';
const {ClientRequest, remote} = require('electron');

var webContents = {
    urls: {
        server: 'https://newsapi.org/v1',
        sources: 'https://newsapi.org/v1/sources',
        articles: 'https://newsapi.org/v1/articles'
    },

    initializeSources: function (fCallback) {
        if (typeof fCallback !== 'function') {
            throw Error('ArgumentError: expected a function');
        }
        let request = new ClientRequest({
            method: 'get',
            url: webContents.urls.sources,
            protocol: 'https:'
        });
        request.on('response', function(response){
            if (response.statusCode >= 200 && response.statusCode < 400){
                let oSources = response.body.sources.reduce((oAcc, oCurr) => {
                    delete oCurr.urlsToLogos;
                    delete oCurr.sortBysAvailable;
                    if (oCurr.category in oAcc) {
                        oAcc[oCurr.category].append(oCurr);
                    } else {
                        oAcc[oCurr.category] = [oCurr];
                    }
                }, {});
                fCallback.call(null, true, oSources);
            } else {
                fCallback.call(null, false, null);
            }
        });
    },
    getSourcesByCategory: function (sCategory) {
        return remote.getGlobal('sources')[sCategory];
    },
    getCategories: function () {
        return Object.keys(remote.getGlobal('sources'));
    },
    getArticles: function (sUrl) {
        if (typeof sUrl !== 'string'){
            throw ('ArgumentErorr: expected a string');
        }
        let request = new Promise(
            function (resolve, reject) {
                let request = new ClientRequest({
                    method: 'get',
                    url: sUrl,
                    protocol: 'https:'
                });
                net.request(sUrl).on('response', function (response){
                    if (response.statusCode >= 200 && response.statusCode < 400) {
                        resolve(response.body.articles);
                    } else {
                        reject('Something went wrong');
                    }
                });
            });
        return request;
    },
    isSourcesLoaded: function () {
        console.log(remote.getGlobal('sources'));
        return remote.getGlobal('sources') ? true: false;
    },
    createUrlForArticles: function (sSource, sSortBy) {
        if (typeof sSource !== 'string' || typeof sSortBy !== 'string') {
            throw Error('ArgumentError: expected a string argument!');
        }
        let apiKey = 'e57b1ad3b323451a837833635a393343';
        return `${webContents.urls.articles}?source=${sSource}&sortBy=${sSortBy}&apiKey=${apiKey}`;
    }
};

module.exports.webContents = webContents;