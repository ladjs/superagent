
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/error', function(req, res){
  throw new Error('oh noes');
});

app.get('/login', function(req, res){
  res.status(200).send('<form id="login"></form>');
});

app.get('/bad-request', function(req, res){
  res.status(400).end();
});

app.get('/unauthorized', function(req, res){
  res.status(401).end();
});

app.get('/not-acceptable', function(req, res){
  res.status(406).end();
});

app.get('/no-content', function(req, res){
  res.status(204).end();
});

app.listen(3004);

describe('flags', function(){

  describe('with 4xx response', function(){
    it('should set res.error and res.clientError', function(done){
      request
      .get('http://localhost:3004/notfound')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(!res.ok, 'response should not be ok');
        assert(res.error, 'response should be an error');
        assert(res.clientError, 'response should be a client error');
        assert(!res.serverError, 'response should not be a server error');
        done();
      });
    })
  })

  describe('with 5xx response', function(){
    it('should set res.error and res.serverError', function(done){
      request
      .get('http://localhost:3004/error')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(!res.ok, 'response should not be ok');
        assert(!res.notFound, 'response should not be notFound');
        assert(res.error, 'response should be an error');
        assert(!res.clientError, 'response should not be a client error');
        assert(res.serverError, 'response should be a server error');
        done();
      });
    })
  })

  describe('with 404 Not Found', function(){
    it('should res.notFound', function(done){
      request
      .get('http://localhost:3004/notfound')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(res.notFound, 'response should be .notFound');
        done();
      });
    })
  })

  describe('with 400 Bad Request', function(){
    it('should set req.badRequest', function(done){
      request
      .get('http://localhost:3004/bad-request')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(res.badRequest, 'response should be .badRequest');
        done();
      });
    })
  })

  describe('with 401 Bad Request', function(){
    it('should set res.unauthorized', function(done){
      request
      .get('http://localhost:3004/unauthorized')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(res.unauthorized, 'response should be .unauthorized');
        done();
      });
    })
  })

  describe('with 406 Not Acceptable', function(){
    it('should set res.notAcceptable', function(done){
      request
      .get('http://localhost:3004/not-acceptable')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(res.notAcceptable, 'response should be .notAcceptable');
        done();
      });
    })
  })

  describe('with 204 No Content', function(){
    it('should set res.noContent', function(done){
      request
      .get('http://localhost:3004/no-content')
      .end(function(err, res){
        assert(!err, 'should not have an error if a response is successfully received and processed');
        assert(res.noContent, 'response should be .noContent');
        done();
      });
    })
  })
})
