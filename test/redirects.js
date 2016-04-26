var setup = require('./support/setup');
var base = setup.uri;

var assert = require('assert');
var request = require('../');

describe('request', function(){
  describe('on redirect', function(){
    it('should retain header fields', function(done){
      request
      .get(base + '/header')
      .set('X-Foo', 'bar')
      .end(function(err, res){
        try {
          assert(res.body);
          res.body.should.have.property('x-foo', 'bar');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should remove Content-* fields', function(done){
      request
      .post(base + '/header')
      .type('txt')
      .set('X-Foo', 'bar')
      .set('X-Bar', 'baz')
      .send('hey')
      .end(function(err, res){
        try {
          assert(res.body);
          res.body.should.have.property('x-foo', 'bar');
          res.body.should.have.property('x-bar', 'baz');
          res.body.should.not.have.property('content-type');
          res.body.should.not.have.property('content-length');
          res.body.should.not.have.property('transfer-encoding');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should preserve timeout across redirects', function(done){
      request
      .get(base + '/movies/random')
      .timeout(250)
      .end(function(err, res){
        try {
          assert(err instanceof Error, 'expected an error');
          err.should.have.property('timeout', 250);
          done();
        } catch(err) {
          done(err);
        }
      });
    })
  });

  describe('on 303', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-303')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=get');
        done();
      })
    })
  })

  describe('on 307', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-307')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=put');
        done();
      })
    })
  })

  describe('on 308', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-308')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=put');
        done();
      })
    })
  })
})
