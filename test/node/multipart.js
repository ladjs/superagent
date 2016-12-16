'use strict';

var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var assert = require('assert');
var fs = require('fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

describe('Reques', function(){

  describe('#field(name, value)', function(){
    it('should set a multipart field value', function(){
      var req = request.post(base + '/echo');

      req.field('user[name]', 'tobi');
      req.field('user[age]', '2');
      req.field('user[species]', 'ferret');

      return req.then(function(res){
        res.body['user[name]'].should.equal('tobi');
        res.body['user[age]'].should.equal('2');
        res.body['user[species]'].should.equal('ferret');
      });
    })

    it('should work with file attachments', function(){
      var req = request.post(base + '/echo');

      req.field('name', 'Tobi');
      req.attach('document', 'test/node/fixtures/user.html');
      req.field('species', 'ferret');

      return req.then(function(res){
        res.body.name.should.equal('Tobi');
        res.body.species.should.equal('ferret');

        var html = res.files.document;
        html.name.should.equal('user.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');
      });
    })
  })

  describe('#attach(name, path)', function(){
    it('should attach a file', function(){
      var req = request.post(base + '/echo');

      req.attach('one', 'test/node/fixtures/user.html');
      req.attach('two', 'test/node/fixtures/user.json');
      req.attach('three', 'test/node/fixtures/user.txt');

      return req.then(function(res){
        var html = res.files.one;
        var json = res.files.two
        var text = res.files.three;

        html.name.should.equal('user.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');

        json.name.should.equal('user.json');
        json.type.should.equal('application/json');
        read(json.path).should.equal('{"name":"tobi"}');

        text.name.should.equal('user.txt');
        text.type.should.equal('text/plain');
        read(text.path).should.equal('Tobi');
      });
    })

    describe('when a file does not exist', function(){
      it('should emit an error', function(done){
        var req = request.post(base + '/echo');

        req.attach('name', 'foo');
        req.attach('name2', 'bar');
        req.attach('name3', 'baz');

        req.on('error', function(err){
          err.message.should.containEql('ENOENT');
          err.path.should.equal('foo');
          done();
        });

        req.end(function(err, res){
          if (err) return done(err);
          assert(0, 'end() was called');
        });
      })
    })
  })

  describe('#attach(name, path, filename)', function(){
    it('should use the custom filename', function(){
      return request
      .post(base + '/echo')
      .attach('document', 'test/node/fixtures/user.html', 'doc.html')
      .then(function(res){
        var html = res.files.document;
        html.name.should.equal('doc.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');
      });
    })
    it('should fire progress event', function(done){
      var loaded = 0;
      var total = 0;
      var uploadEventWasFired = false;
      request
      .post(base + '/echo')
      .attach('document', 'test/node/fixtures/user.html')
      .on('progress', function (event) {
        total = event.total;
        loaded = event.loaded;
        if (event.direction === 'upload') {
          uploadEventWasFired = true;
        }
      })
      .end(function(err, res){
        if (err) return done(err);
        var html = res.files.document;
        html.name.should.equal('user.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');
        total.should.equal(223);
        loaded.should.equal(223);
        uploadEventWasFired.should.equal(true);
        done();
      })
    })
    it('filesystem errors should be caught', function(done){
      request
          .post(base + '/echo')
          .attach('filedata', 'test/node/fixtures/non-existent-file.ext')
          .on('error', function(err) {
            err.code.should.equal('ENOENT')
            err.path.should.equal('test/node/fixtures/non-existent-file.ext')
            done()
          })
          .end(function (err, res) {
            done(new Error("Request should have been aborted earlier!"))
          })
    })
  })

  describe('#field(name, val)', function() {
    it('should set a multipart field value', function(done) {
      request.post(base + '/echo')
      .field('first-name', 'foo')
      .field('last-name', 'bar')
      .end(function(err, res) {
        if(err) done(err);
        res.should.be.ok();
        res.body['first-name'].should.equal('foo');
        res.body['last-name'].should.equal('bar');
        done();
      });
    });
  });

  describe('#field(object)', function() {
    it('should set multiple multipart fields', function(done) {
      request.post(base + '/echo')
      .field({ 'first-name': 'foo', 'last-name': 'bar' })
      .end(function(err, res) {
        if(err) done(err);
        res.should.be.ok();
        res.body['first-name'].should.equal('foo');
        res.body['last-name'].should.equal('bar');
        done();
      });
    });
  });
})
