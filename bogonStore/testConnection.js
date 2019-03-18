'use strict';
const isOnline = require('is-online');

module.exports = {};

function isSystemOnline(fCallbackIfOnline, fCallbackIfOffline) {
    if (typeof fCallbackIfOnline !== 'function' && typeof fCallbackIfOffline !== 'function') {
        throw ('ArgumentError: expected a function');
    }
    isOnline().then(function (online) {
        if (online) {
            fCallbackIfOnline();
        } else {
            fCallbackIfOffline();
        }
    });
}

module.exports.isSystemOnline = isSystemOnline;

