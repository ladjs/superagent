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
        (res.body.length - img.length).should.equal(0);
        done();
      });
    });
  });
});
