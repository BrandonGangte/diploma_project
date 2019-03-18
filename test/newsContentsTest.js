'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();


const webContents = require('./../src/scripts/newsContents');
const WebRequest = webContents.WebRequest;

describe('getWebContents', function () {
    if (webContents.checkActiveSources) {
        describe('checkActiveSources', function(){
            it('should return a object list of all active resources', function(){
                return webContents.checkActiveSources.then(function(result){
                        result.should.be.a('object');
                        expect(result).to.not.be.empty;
                });
            });
        });
    }

    describe('allActiveSources', function(){
        it('should be loaded with all the active news sources', function () {
            return expect(webContents.allActiveSources).to.not.be.empty;
        })
    });

    describe ('WebRequest', function () {
        var condition = true; // set this true or false according to the condition.
        describe('isSystemOnline', function () {
            var netWorkTest;

            beforeEach(function(){
                netWorkTest = WebRequest.isSystemOnline();
            });

            it('should respond with boolean', function () {
                return netWorkTest.should.eventually.be.a('boolean');
            });

            it('should respond true when online', function () {
                return netWorkTest.should.eventually.equal(condition);
            });
        });

        describe('isReachable', function(){
            var serverTest;
            beforeEach(function () {
                serverTest = WebRequest.isSourceReachable('google.com');
            });
            
            it('should respond with a boolean', function () {
                return serverTest.should.eventually.be.a('boolean');
            });

            it('should respond true when reachable', function(){
                return serverTest.should.eventually.equal(condition);
            });
        });

        describe('getTopNewsFromAll', function() {
            var topNewsFromAll;
            beforeEach(function (){
                topNewsFromAll = WebRequest.getTopNewsFromAll();
            })
            it('should return an object list of articles from sources', function(){
                return topNewsFromAll.should.eventually.be.a('object');
            });

            it('must return a non empty object', function (){
                return topNewsFromAll.should.eventually.not.be.empty;
            });
        });

        describe('getRecentNewsFromAll', function() {
            var recentNewsFromAll;
            beforeEach(function (){
                recentNewsFromAll = WebRequest.getRecentNewsFromAll();
            });

            it('should retrieve and array list of objects', function(){
                return recentNewsFromAll.should.eventually.be.a('object');
            });

            it('should retrive non empty list of objects', function(){
                return recentNewsFromAll.should.eventually.not.be.empty;
            });
        });
    });
});
