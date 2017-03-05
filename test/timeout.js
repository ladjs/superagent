var setup = require('./support/setup');
var base = setup.uri;
var assert = require('assert');
var request = require('../');

describe('.timeout(ms)', function(){
  this.timeout(15000);

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
    });

    it('should handle gzip timeout', function(done){
      request
      .get(base + '/delay/zip')
      .timeout(150)
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        done();
      });
    });

    it('should handle buffer timeout', function(done){
      request
      .get(base + '/delay/json')
      .buffer(true)
      .timeout(150)
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        done();
      });
    });

    it('should error on deadline', function(done){
      request
      .get(base + '/delay/500')
      .timeout({deadline: 150})
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        done();
      });
    });

    it('should support setting individual options', function(done){
      request
      .get(base + '/delay/500')
      .timeout({deadline: 10})
      .timeout({response: 99999})
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        assert.equal('ETIME', err.errno);
        done();
      });
    });

    it('should error on response', function(done){
      request
      .get(base + '/delay/500')
      .timeout({response: 150})
      .end(function(err, res){
        assert(err, 'expected an error');
        assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
        assert.equal('ECONNABORTED', err.code, 'expected abort error code')
        assert.equal('ETIMEDOUT', err.errno);
        done();
      });
    });

    it('should accept slow body with fast response', function(done){
      request
        .get(base + '/delay/slowbody')
        .timeout({response: 1000})
        .on('progress', function(){
          // This only makes the test faster without relying on arbitrary timeouts
          request.get(base + '/delay/slowbody/finish').end();
        })
        .end(done);
    });
  })
})
