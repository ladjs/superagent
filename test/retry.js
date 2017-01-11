var setup = require('./support/setup');
var base = setup.uri;
var assert = require('assert');
var request = require('../');

describe('.retry(count)', function(){
  this.timeout(15000);

  it('should handle server error after repeat attempt', function(done){
    request
    .get(base + '/error')
    .retry(2)
    .end(function(err, res){
      assert(err, 'expected an error');
      assert.equal(2, err.retries, 'expected an error with .attempts');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
    });
  });

  it('should handle successful request after repeat attempt from server error', function(done){
    var id = Math.random() * 1000000 * Date.now();
    request
    .get(base + '/error/ok/' + id)
    .retry(2)
    .end(function(err, res){
      assert(res.ok, 'response should be ok');
      assert(res.text, 'res.text');
      done();
    });
  });

  it('should handle server timeout error after repeat attempt', function(done) {
    request
    .get(base + '/delay/150')
    .timeout(50)
    .retry(2)
    .end(function(err, res){
      assert(err, 'expected an error');
      assert.equal(2, err.retries, 'expected an error with .attempts');
      assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
      assert.equal('ECONNABORTED', err.code, 'expected abort error code')
      done();
    });
  });

  it('should handle successful request after repeat attempt from server timeout', function(done) {
    var id = Math.random() * 1000000 * Date.now();
    request
    .get(base + '/delay/150/ok/' + id)
    .timeout(50)
    .retry(2)
    .end(function(err, res){
      assert(res.ok, 'response should be ok');
      assert(res.text, 'res.text');
      done();
    });
  });

  it('should correctly abort a retry attempt', function(done) {
    var aborted = false;
    var req = request
    .get(base + '/delay/200')
    .timeout(100)
    .retry(2)
    .end(function(err, res){
      try {
        assert(false, 'should not complete the request');
      } catch(e) { done(e); }
    });

    req.on('abort', function() {
      aborted = true;
    });

    setTimeout(function() {
      req.abort();
      setTimeout(function() {
        assert(aborted, 'should be aborted');
        done();
      }, 150)
    }, 150);
  });

  it('should handle successful redirected request after repeat attempt from server error');
})