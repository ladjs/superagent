'use strict';

var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var fs = require('fs');

var img = fs.readFileSync(__dirname + '/fixtures/test.png');

describe('res.body', function(){
  describe('image/png', function(){
    it('should parse the body', function(done){
      request
      .get(base + '/image')
      .end(function(err, res){
        res.type.should.equal('image/png');
        Buffer.isBuffer(res.body).should.be.true();
        (res.body.length - img.length).should.equal(0);
        done();
      });
    });
  });
  describe('application/octet-stream', function(){
    it('should parse the body', function(done){
      request
      .get(base + '/image-as-octets')
      .buffer(true) // that's tech debt :(
      .end(function(err, res){
        res.type.should.equal('application/octet-stream');
        Buffer.isBuffer(res.body).should.be.true();
        (res.body.length - img.length).should.equal(0);
        done();
      });
    });
  });
  describe('application/octet-stream', function(){
      it('should parse the body (using responseType)', function(done){
          request
              .get(base + '/image-as-octets')
              .responseType('blob')
              .end(function(err, res){
                  res.type.should.equal('application/octet-stream');
                  Buffer.isBuffer(res.body).should.be.true();
                  (res.body.length - img.length).should.equal(0);
                  done();
              });
      });
  });
});
