
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.use(express.basicAuth('tobi', 'learnboost'));

app.get('/', function(req, res){
  res.end('you win!');
});

app.listen(3010);

describe('req.auth(user, pass)', function(){
  describe('when valid', function(){
    it('should serve the request', function(done){
      request
      .get('http://localhost:3010')
      .auth('tobi', 'learnboost')
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('when invalid', function(){
    it('should 401', function(done){
      request
      .get('http://localhost:3010')
      .auth('tobis', 'learnboost')
      .end(function(res){
        res.status.should.equal(401);
        done();
      });
    })
  })
})