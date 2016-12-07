var setup = require('./support/setup');
var base = setup.uri;
var assert = require('assert');
var request = require('../');

describe('.timeout(ms)', function(){
  describe('when timeout is exceeded', function(){
    it('should error', function(done){
      request
      .get(base + '/delay/500')
      .timeout(150)
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        done();
      });
    })
  })
})
