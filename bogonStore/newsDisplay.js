'use strict';
const isOnline = require('is-online');
const {ipcRenderer} = require('electron');

isOnline().then(online => {
    if (!online){
        ipcRenderer.send('internet-connection', false);
    }
    const {net} = require('electron');
    const {app} = require('electron').remote;
    const path = require('path');
    const fs = require('fs');
    const sNewsSourcePath = path.join(app.getPath('appData'), 'sources.json');
    var oSources = fs.readFileSync(sNewsSourcePath, 'utf-8');
    if (!oSources) {
        net.request('https://newsapi.org/v1/sources')
            .on('response', (response) => {
                if(response.statusCode >= 200 && response.statusCode < 400){
                    let oSources = response.body.sources.reduce((oAcc, oCurr) => {
                        delete oCurr.urlsToLogos;
                        oAcc[oCurr.category] = oCurr;
                    }, {})
                }
            })
    }


});