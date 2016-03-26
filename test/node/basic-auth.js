
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , basicAuth = require('basic-auth-connect');

app.get('/basic-auth', basicAuth('tobi', 'learnboost'), function(req, res){
  res.end('you win!');
});

app.get('/basic-auth/again', basicAuth('tobi', ''), function(req, res){
  res.end('you win again!');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('Basic auth', function(){
  describe('when credentials are present in url', function(){
    it('should set Authorization', function(done){
      request
      .get('http://tobi:learnboost@localhost:' + server.address().port + '/basic-auth')
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass)', function(){
    it('should set Authorization', function(done){
      request
      .get(base + '/basic-auth')
      .auth('tobi', 'learnboost')
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user + ":" + pass)', function(){
    it('should set authorization', function(done){
      request
      .get(base + '/basic-auth/again')
      .auth('tobi')
      .end(function(err, res){
        res.status.should.eql(200);
        done();
      });
    })
  })
})
