
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , basicAuth = require('basic-auth-connect');

app.get('/', basicAuth('tobi', 'learnboost'), function(req, res){
  res.end('you win!');
});

app.get('/again', basicAuth('tobi', ''), function(req, res){
  res.end('you win again!');
});

app.listen(3010);

describe('Basic auth', function(){
  describe('when credentials are present in url', function(){
    it('should set Authorization', function(done){
      request
      .get('http://tobi:learnboost@localhost:3010')
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass)', function(){
    it('should set Authorization', function(done){
      request
      .get('http://localhost:3010')
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
      .get('http://localhost:3010/again')
      .auth('tobi')
      .end(function(err, res){
        res.status.should.eql(200);
        done();
      });
    })
  })
})
