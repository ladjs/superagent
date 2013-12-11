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

  app.listen(3011);

  describe('image/png', function(){
    it('should parse the body', function(done){
      request
      .get('http://localhost:3011/image')
      .end(function(res){
        res.body.should.eql(img.toString('utf8'));
        done();
      });
    });
  });
});
