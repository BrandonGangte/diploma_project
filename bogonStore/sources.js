'use strict';
/**
 * This module is used to set up the news repositories used
 * in the application.
 * 
 * All the sources are available from https://newsapi.org
 */

const SOURCE_LINK = 'https://newsapi.org/v1/sources';

// using the got http library from npm
const got = require('got');
var exports = module.exports = {};

function flatten(aArrayOfArrays, callback) {
    if(!aArrayOfArrays || !Array.isArray(aArrayOfArrays)) {
        throw Error('ArgumentError: needed an array as argument, got '+ typeof aArrayOfArrays);
    }
    callback = callback || null;
    let aFlattened = aArrayOfArrays.reduce((acc, currentVal) => {
        return acc.concat(currentVal);
    }, []);

    if (typeof callback === 'function') {
        callback.call(null, aFlattened);
    }
}

function makeAPromise (callback) {
    if(typeof callback !== 'function'){
        throw Error("ArgumentError: expected a function, got "+typeof callback);
    }
    let promise = new Promise(
        (resolve, reject) => {
            callback.call(undefined, resolve, reject);
        }
    );
    return promise;
}

function getAllSources() {
    return makeAPromise((resolve, reject) =>{
        got(SOURCE_LINK, {
            protocol: 'https:',
            method: 'get',
            json: true,
            headers: {
                'user-agent': 'Electron/DailyNews 0.1'
            }
        }).then(res => {
            let body = res.body;
            if (body.status !== 'ok') reject('Server Responded With error!');
            resolve(body.sources.reduce((acc, currentObj) => {
                let category = currentObj.category;
                if (!(category in acc)) acc[category] = [];
                acc[category].push({
                    id: currentObj.id,
                    name: currentObj.name,
                    description: currentObj.description,
                    language: currentObj.language,
                    country: currentObj.country,
                    sortingMethods: currentObj.sortByAvailable
                });
                return acc;
            }, {}));
        }).catch(reason => {
            reject(reason);
        });
    });
}

// returns a promise for an array list of sources by language.
// empty array if no match found
function getSourcesByLanguage(language){
    if (!language || typeof language !== 'string') {
        throw Error('ArgumentError: need a string argument');
    }

    return makeAPromise((resolve, reject) => {
        getAllSources().then(all => {
            flatten(Object.values(all), sourceArray => {
                resolve(sourceArray.reduce((acc, curent)=>{
                    if(curent.language === language) acc.push(curent);
                    return acc;
                },[]));
            });
        }).catch(reason => {
            reject(reason);
        });
    });
}

function getSourcesByCategory(sCategory) {
    if (!sCategory || typeof sCategory !== 'string'){
        throw Error('ArgumentError: need a valid string argument');
    }
    return makeAPromise((resolve, reject) => {
        getAllSources().then(all => {
                resolve(() => {
                    if (sCategory in all) return all[sCategory];
                });
            }).catch(reason => {reject(reason);});
    })
}

function getSourcesByCountry(sCountryId){
    if (!sCountryId || typeof sCountryId !== 'string'){
        throw Error('ArgumentError: need a valid string argument');
    }

    return makeAPromise((resolve, reject) => {
        getAllSources().then(all => {
            flatten(all, aSouce => {
                resolve(aSouce.reduce((aAcc, oPrev) => {
                    if(oPrev.country == sCountryId) return aAcc.push(oPrev);
                }, []));
            });
        }).catch(reason => {reject(reason)});
    });
}

function Sources() {
    this.init = () => {
        getAllSources().then(
            sources => {
                this.oSourceByCategory = sources;
                this.categories = Object.keys(sources);
                this.countries = Object.values(sources).reduce((aCountry, sCurr) => {
                    if (aCountry.indexOf(sCurr) === -1){
                        return aCountry.push(sCurr.country);
                    }
                    return aCountry;
                }, []);
                this.languages = Object.values(sources).reduce((aLang, sCurr) => {
                    if (aLange.indexOf(sCurr) === -1){
                        return aLang.push(sCurr.language);
                    }
                    return aLang;
                }, []);
                this.ids = Object.values(sources).reduce((aId, sCurr) => {
                    return aId.push(sCurr.id);
                }, []);
            }
        ).catch(reason => {
            throw Error("networkError: error in fetching sources");
        });
    }
    this.sortByCountry = () =>{
        this.oSourceByCountry = Object.values(this.oSourceByCategory).reduce((oByCountry, oSource) => {
            if(oSource.country in oByCountry){
                return oByCountry[oSource.country].push(oSource);
            }
            return oByCountry[oSource.country] =  [oSource];
        }, {});
    }

    this.sortByLanguage = () => {
        this.oSourceByLanguage = Object.values(this.oSourceByCategory).reduce(
            (oByLang, oSource) => {
                if (oSource.language in oByLang) {
                    return oByLang[oSource.language].push(oSource);
                }
                return oByLang[oSource.language] = [oSource];
            }, {}
        );
    }
    this.getById = (sId) => {
        if(!sId || typeof sId !== 'string') {
            throw Error('ArgumentError: expected a string, got ' + typeof sId);
        }
        return Object.values(this.oSourceByCategory).find(elem => {return elem.id === sId;});
    }
    this.init();
}

exports.Sources = Sources;
exports.makeAPromise = makeAPromise;
exports.flatten = flatten;
exports.getSourcesByLanguage = getSourcesByLanguage;
exports.getAllSources = getAllSources;