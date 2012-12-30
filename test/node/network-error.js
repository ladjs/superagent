
var request = require('../..')
  , express = require('express')
  , assert = require('assert')
  , net = require('net');

function getFreePort(fn) {
  var server = net.createServer();
  server.listen(0, function(){
    var port = server.address().port;
    server.close(function(){
      fn(port);
    });
  });
};

describe('with network error', function(){
  before(function(done){
    var self = this;
    // connecting to a free port
    // will trigger a connection refused
    getFreePort(function(port){
      self.port = port;
      done();
    });
  });

  it('should error', function(done) {
    request
    .get('http://localhost:' + this.port + '/')
    .end(function(err, res){
      assert(err, 'expected an error');
      done();
    });
  });
});
