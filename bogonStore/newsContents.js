/**
 * @file: get-web-contents.js.
 * @description: This module contains all the methods and classes used for making
 *               web request, leaving the formatting duty to the renderer.
 */

// chromium native networking library
const {net} = require('electron');

// to check if connected to internet.
const isOnline = require('is-online');

// check for active sources
const isReachable = require('is-reachable');

const AppStore = require('./appStore').AppStore;

var exports = module.exports = {};

// Constants private only to this module.
const APIKEY = 'e57b1ad3b323451a837833635a393343';
const SOURCE = 'https://newsapi.org';

function buildLink (source, sortOrder) {
    source = source || '';
    sortOrder = sortOrder || '';
    if(typeof source !== 'string' || typeof sortOrder !== 'string') {
        throw Error('buildLinkError: expected string parameters');
    }
    if (!source) throw Error('buildLinkError: expected source as argument.')
    if (source && !sortOrder) return SOURCE + '/v1/articles?source=' + source;

    return SOURCE + '/v1/articles?source=' + source + '&sortBy=' + sortOrder + '&apiKey='+APIKEY;
}

var newsCategoryObj = new AppStore('newsCategory.json');
const NEWSSOURCES = newsCategoryObj.getAllData();

var allActiveSources;

/**
 * @description: return an array containing all the active sources.
 */
let checkActiveSources = new Promise(
    // A new promise to test for all the active sources.
    (resolve, reject) => {
        // iterate over all the categories in the NEWSSOURCES object
        // outerCurrKey is the current category we are iterating over.
        // outerPrevObj is the final Object to be returned with all the active sources.
        resolve(Object.keys(NEWSSOURCES).reduce((outerPrevObj, outerCurrKey) => {
            // This iteration if for the inner object with the sourcename and link.
            // innerCurrKey is the source name and innerPrevObj, the object to be returned.
            Object.keys(NEWSSOURCES[outerCurrKey]).reduce((innerPrevObj, innerCurrKey) =>{
                let url = buildLink(innerCurrKey);
                let sourceName = innerCurrKey;
                isReachable(url + '&apiKey=' + APIKEY)
                .then(res => {
                    // if success ...
                    if (res) outerPrevObj[outerCurrKey] = innerPrevObj[innerCurrKey] = url;
                }).catch(/*.. raise a no internet error!*/);
            }, {});
        }, {})); // end of resolve.
    });

exports.checkActiveSources = checkActiveSources;

checkActiveSources
.then(res => {allActiveSources = res})
.catch(/*raise network error*/);

/**
 * @description: An class containing all the utilities for handling network
 *               requests and maintaining sources. All properties are to be loaded
 *               on import.
 */
function WebRequest () {
    //...TODO

}

// static methods.
WebRequest.getTopNewsFromAll = () => {
    let sortBy = 'top';
    let topNews = new Promise(
        (resolve, reject) => {
            //...
        }
    );
}




WebRequest.isSystemOnline = isOnline;
WebRequest.isSourceReachable = isReachable;

exports.allActiveSources = allActiveSources;
exports.WebRequest = WebRequest;