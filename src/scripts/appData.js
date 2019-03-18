'use strict';
const path = require('path');
const fs = require('fs');
const app = require('electron').remote.app;

module.exports = {};

var appData = {
    paths: {
        appDataDir: app.getPath('userData'),
        viewsDir: path.join(__dirname, '../../app/views/'),
        fragmentsDir: path.join(__dirname, '../../app/views/fragments/'),
        oNewsSourcesPath: path.join(app.getPath('userData'), 'sources.json')
    },
    getContents: function (sFileName, fCallback) {
        if (!sFileName || typeof sFileName !== 'string') {
            throw ('ArgumentError: expected a string');
        }
        if (!fs.existsSync(path.join(appData.paths.appDataDir, sFileName))) {
            fCallback.call(null, new Error('File not present!'), null);
            return;
        }

        fs.readFile(path.join(appData.paths.appDataDir, sFileName), 'utf-8', (err, oContents) => {
            if (err) {
                fCallback.call(null, err, null);
            } else {
                if (oContents) {
                    
                    fCallback.call(null, null, JSON.parse(oContents));
                } else {
                    fCallback.call(null, null, null);
                }
            }
        });
    },
    setContents: function (sFileName, oContents, fCallback) {
        if (!sFileName || typeof sFileName !== 'string') {
            throw('ArgumentError: expected a string');
        }

        if (typeof fCallback !== 'function') {
            throw new Error('ArgumentError: expected a function' +
                    ' as third argument!');
        }

        fs.writeFile(path.join(appData.paths.appDataDir, sFileName),
                JSON.stringify(oContents), {encoding: 'utf-8'}, fCallback);
    },
    readFromViews: function (sFileName) {
        let pathToFile = path.join(appData.paths.viewsDir, sFileName);
        try {
            return fs.readFileSync(pathToFile, 'utf-8');
        } catch (e) {
            throw (e);
        }
    },
    readFromFragments: function (sFileName) {
        let pathToFile = path.join(appData.paths.fragmentsDir, sFileName);
        try {
            return fs.readFileSync(pathToFile, 'utf-8');
        } catch (e) {
            throw (e);
        }
    },
    saveToFile: (sFileName, oContents) => {
        fs.writeFileSync(path.join(appData.paths.appDataDir, sFileName),
            JSON.stringify(oContents), {encoding: 'utf-8'});
    },
    readFromFile: sFileName => {
        return JSON.parse(fs.readFileSync(path.join(appData.paths.appDataDir, sFileName), 'utf-8'));
    }
};

module.exports.appData = appData;