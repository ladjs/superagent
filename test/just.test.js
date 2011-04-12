
/**
 * Module dependencies.
 */

var just = require('just')
  , should = require('should');

module.exports = {
  'test .version': function(){
    just.version.should.match(/^\d+\.\d+\.\d+$/);
  }
};