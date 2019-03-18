'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const AppStore = require('./../src/scripts/appStore').AppStore;

describe("AppStore", function(){
    var appStoreTest;
    beforeEach(function(){
        appStoreTest = new AppStore('newsCategory.json');
    });

    describe("loadFromFile", function(){
        var afterLoad;
        beforeEach(function (){
            afterLoad = appStoreTest.loadFromFile();
        });
        it("should return the calling object back", function(){
            afterLoad.should.equal(appStoreTest);
        });
        it("should load the contents of the file to the internal datastructure", function(){
            afterLoad.getAllData().should.be.a('object');
            afterLoad.getAllData().should.not.be.empty;
        });
        describe("getData", function(){
            it("should return a non empty object", function(){
                afterLoad.getData("Top Stories").should.be.a('object');
                afterLoad.getData("Top Stories").should.not.be.empty;
            });
        });
    });
});