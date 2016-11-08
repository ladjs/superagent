var setup = require('./support/setup');
var uri = setup.uri;

var assert = require('assert');
var request = require('../');

describe('req.set("Content-Type", contentType)', function(){
  this.timeout(20000);

  it('should work with just the contentType component', function(done){
    request
    .post(uri + '/echo')
    .set('Content-Type', 'application/json')
    .send({ name: 'tobi' })
    .end(function(err, res){
      assert(!err);
      done();
    });
  });

  it('should work with the charset component', function(done){
    request
    .post(uri + '/echo')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send({ name: 'tobi' })
    .end(function(err, res){
      assert(!err);
      done();
    });
  });

});
