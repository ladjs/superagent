var setup = require('./support/setup');
var base = setup.uri;
var assert = require('assert');
var request = require('../');

function uniqid() {
  return Math.random() * 10000000;
}

describe('.retry(count)', function(){
  this.timeout(15000);

  it('should not retry if passed "0"', function(done){
    request
    .get(base + '/error')
    .retry(0)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(undefined, err.retries, 'expected an error without .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should not retry if passed an invalid number', function(done){
    request
    .get(base + '/error')
    .retry(-2)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(undefined, err.retries, 'expected an error without .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should not retry if passed undefined', function(done){
    request
    .get(base + '/error')
    .retry(undefined)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(undefined, err.retries, 'expected an error without .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should handle server error after repeat attempt', function(done){
    request
    .get(base + '/error')
    .retry(2)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(2, err.retries, 'expected an error with .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should retry if passed nothing', function(done){
    request
    .get(base + '/error')
    .retry()
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(1, err.retries, 'expected an error with .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should retry if passed "true"', function(done){
    request
    .get(base + '/error')
    .retry(true)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(1, err.retries, 'expected an error with .retries');
      assert.equal(500, err.status, 'expected an error status of 500');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should handle successful request after repeat attempt from server error', function(done){
    request
    .get(base + '/error/ok/' + uniqid())
    .query({qs:'present'})
    .retry(2)
    .end(function(err, res){
      try {
      assert.ifError(err);
      assert(res.ok, 'response should be ok');
      assert(res.text, 'res.text');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should handle server timeout error after repeat attempt', function(done) {
    request
    .get(base + '/delay/400')
    .timeout(200)
    .retry(2)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(2, err.retries, 'expected an error with .retries');
      assert.equal('number', typeof err.timeout, 'expected an error with .timeout');
      assert.equal('ECONNABORTED', err.code, 'expected abort error code')
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should handle successful request after repeat attempt from server timeout', function(done) {
    request
    .get(base + '/delay/400/ok/' + uniqid())
    .timeout(200)
    .retry(2)
    .end(function(err, res){
      try {
      assert.ifError(err);
      assert(res.ok, 'response should be ok');
      assert(res.text, 'res.text');
      done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should correctly abort a retry attempt', function(done) {
    var aborted = false;
    var req = request
    .get(base + '/delay/400')
    .timeout(200)
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
        try {
        assert(aborted, 'should be aborted');
        done();
        } catch(err) {
          done(err);
        }
      }, 150)
    }, 150);
  });

  it('should correctly retain header fields', function(done) {
    request
    .get(base + '/error/ok/' + uniqid())
    .query({qs:'present'})
    .retry(2)
    .set('X-Foo', 'bar')
    .end(function(err, res){
      try {
        assert.ifError(err);
        assert(res.body);
        res.body.should.have.property('x-foo', 'bar');
        done();
      } catch(err) {
        done(err);
      }
    });
  });

  it('should not retry on 4xx responses', function(done) {
    request
    .get(base + '/bad-request')
    .retry(2)
    .end(function(err, res){
      try {
      assert(err, 'expected an error');
      assert.equal(0, err.retries, 'expected an error with 0 .retries');
      assert.equal(400, err.status, 'expected an error status of 400');
      done();
      } catch(err) {
        done(err);
      }
    });
  });
})
