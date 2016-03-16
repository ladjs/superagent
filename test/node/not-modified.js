require('should');
require('should-http');

var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/', function(req, res){
  if (req.header('if-modified-since')) {
    res.status(304).end();
  } else {
    res.send('' + Date.now());
  }
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('request', function(){
  describe('not modified', function(){
    var ts;
    it('should start with 200', function(done){
      request
      .get(base)
      .end(function(err, res){
        res.should.have.status(200)
        res.text.should.match(/^\d+$/);
        ts = +res.text;
        done();
      });
    })

    it('should then be 304', function(done){
      request
      .get(base)
      .set('If-Modified-Since', new Date(ts).toUTCString())
      .end(function(err, res){
        res.should.have.status(304)
        // res.text.should.be.empty
        done();
      });
    })
  })
})
