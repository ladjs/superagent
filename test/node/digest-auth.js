
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , auth = require('http-auth');

var digest = auth({
  authRealm: 'Test digest realm',
  authList: ['james:learnnode'],
  authType: 'digest'
});

app.use(digest);

app.get('/', function(req, res){
  res.end('you win!');
});

app.listen(3030);

describe('Digest auth', function(){
  describe('when credentials are present in url', function(){
    it('should use digest authentication', function(done){
      request
      .get('http://james:learnnode@localhost:3030')
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass)', function(){
    it('should use digest authentication', function(done){
      request
      .get('http://localhost:3030')
      .auth('james', 'learnnode')
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass, true)', function(){
    it('should use digest authentication', function(done){
      request
      .get('http://localhost:3030')
      .auth('james', 'learnnode', true)
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass, false)', function(){
    it('should use digest authentication', function(done){
      request
      .get('http://localhost:3030')
      .auth('james', 'learnnode', false)
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })
})
