'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const assert = chai.assert;
const expect = chai.expect;
const should = chai.should();

const sources = require('./../src/scripts/sources');

describe('getAllSources', function(){
    var promise;
    beforeEach(function(){
        promise = sources.getAllSources();
    })
    it('should be fulfilled', function(){
        return assert.isFulfilled(promise);
    })
    it('should return an object list of news sources', function(){
        return promise.should.eventually.be.a('object');
    })

    it('should not be empty', function(){
        return expect(promise).to.eventually.not.be.empty;
    })
})

describe('flatten', function(){
    it('should throw error when input is invalid', function(){
        expect(function(){
            sources.flatten(1234)
        }).to.throw;
        expect(function(){
            sources.flatten('iaman dsaf')
        }).to.throw;
        expect(function(){
            sources.flatten({hoky:'poky'})
        }).to.throw;
    });

    it('should return empty array when an empty array is passed', function(){
        sources.flatten([], function(aFlattened){
            aFlattened.should.be.empty;
            assert.lengthOf(aFlattened, 0);
        })
    })
    it('should return a flattened array', function(done){
        sources.flatten([[1,2,], [1,2,3]], aFlattened => {
            aFlattened.should.be.a('array');
            assert.lengthOf(aFlattened, 5);
            expect(aFlattened).to.eql([1,2,1,2,3]);
            done();
        });
    });
})

describe('makeAPromise', function(){
    it('should throw error if argument is not a function', function(){
        var aTest = ['string', {jak:'tak'}, 1234, [], null];
        aTest.forEach(function(value){
            expect(function(){
                sources.makeAPromise(value);
            }).to.throw;
        });
    })

    it('should return a promise with the result of callback being passed to then',
    function(){
        return sources.makeAPromise(function(resolve, reject){
            resolve(10);
        }).should.eventually.eql(10);
    });

    it('should catch reject cases in the returned promises', function(){
        return sources.makeAPromise(function(resolve, reject){
            reject('Will be rejected!')
        }).should.eventually.be.rejected;
    })
})