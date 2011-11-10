
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.get('/error', function(req, res){
  throw new Error('oh noes');
});

app.listen(3000);

// TODO: "response" event should be a Response

describe('request.VERB(path)', function(){
  describe('with 4xx response', function(){
    it('should set flags properly', function(done){
      request
      .get('http://localhost:3000/notfound')
      .end(function(res){
        assert(!res.ok, 'response should not be ok');
        assert(res.error, 'response should be an error');
        assert(res.clientError, 'response should be a client error');
        assert(!res.serverError, 'response should not be a server error');
        done();
      });
    })
  })
  
  describe('with 5xx response', function(){
    it('should set flags properly', function(done){
      request
      .get('http://localhost:3000/error')
      .end(function(res){
        assert(!res.ok, 'response should not be ok');
        assert(!res.notFound, 'response should not be notFound');
        assert(res.error, 'response should be an error');
        assert(!res.clientError, 'response should not be a client error');
        assert(res.serverError, 'response should be a server error');
        done();
      });
    })
  })
  
  describe('with 404 response', function(){
    it('should set flags properly', function(done){
      request
      .get('http://localhost:3000/notfound')
      .end(function(res){
        assert(res.notFound, 'response should be .notFound');
        done();
      });
    })
  })

  describe('.end()', function(){
    it('should issue a request', function(done){
      request
      .get('http://localhost:3000/login')
      .end(function(res){
        assert(res.status == 200);
        done();
      });
    })
  })
})