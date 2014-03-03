
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.use(express.basicAuth('tobi', 'learnboost'));

app.get('/', function(req, res){
  res.end('you win!');
});

app.listen(3010);

describe('Basic auth', function(){
  describe('when credentials are present in url', function(){
    it('should set Authorization', function(done){
      request
      .get('http://tobi:learnboost@localhost:3010')
      .end(function(res){
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
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user + ":" + pass)', function(){
    it('should set authorization', function(done){
      request
      .get('http://localhost:3010')
      .auth('tobi:learnboost')
      .end(function(res){
        res.status.should.eql(200);
        done();
      });
    })
  })
})
