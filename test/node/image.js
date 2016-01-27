/* jshint indent: 2 */
/* jshint laxcomma: true */

var EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();


describe('res.body', function(){
  'use strict';

  var img = fs.readFileSync(__dirname + '/fixtures/test.png');

  app.get('/image', function(req, res){
    res.writeHead(200, {'Content-Type': 'image/png' });
    res.end(img, 'binary');
  });

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

  describe('image/png', function(){
    it('should parse the body', function(done){
      request
      .get(base + '/image')
      .end(function(err, res){
        (res.body.length - img.length).should.equal(0);
        done();
      });
    });
  });
});
