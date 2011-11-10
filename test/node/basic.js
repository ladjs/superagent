
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.get('/bad-request', function(req, res){
  res.send(400);
});

app.get('/unauthorized', function(req, res){
  res.send(401);
});

app.get('/not-acceptable', function(req, res){
  res.send(406);
});

app.get('/no-content', function(req, res){
  res.send(204);
});

app.get('/error', function(req, res){
  throw new Error('oh noes');
});

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.listen(3000);

// TODO: "response" event should be a Response

describe('request.VERB(path)', function(){
  describe('with 4xx response', function(){
    it('should set res.error and res.clientError', function(done){
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
    it('should set res.error and res.serverError', function(done){
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
  
  describe('with 404 Not Found', function(){
    it('should res.notFound', function(done){
      request
      .get('http://localhost:3000/notfound')
      .end(function(res){
        assert(res.notFound, 'response should be .notFound');
        done();
      });
    })
  })
  
  describe('with 400 Bad Request', function(){
    it('should set req.badRequest', function(done){
      request
      .get('http://localhost:3000/bad-request')
      .end(function(res){
        assert(res.badRequest, 'response should be .badRequest');
        done();
      });
    })
  })
  
  describe('with 401 Bad Request', function(){
    it('should set res.unauthorized', function(done){
      request
      .get('http://localhost:3000/unauthorized')
      .end(function(res){
        assert(res.unauthorized, 'response should be .unauthorized');
        done();
      });
    })
  })
  
  describe('with 406 Not Acceptable', function(){
    it('should set res.notAcceptable', function(done){
      request
      .get('http://localhost:3000/not-acceptable')
      .end(function(res){
        assert(res.notAcceptable, 'response should be .notAcceptable');
        done();
      });
    })
  })
  
  describe('with 204 No Content', function(){
    it('should set res.noContent', function(done){
      request
      .get('http://localhost:3000/no-content')
      .end(function(res){
        assert(res.noContent, 'response should be .noContent');
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
  
  describe('res.header', function(){
    it('should be an object', function(done){
      request
      .get('http://localhost:3000/login')
      .end(function(res){
        assert('Express' == res.header['x-powered-by']);
        done();
      });
    })
  })
  
  describe('res.statusType', function(){
    it('should provide the first digit', function(done){
      request
      .get('http://localhost:3000/login')
      .end(function(res){
        assert(200 == res.status);
        assert(2 == res.statusType);
        done();
      });
    })
  })

  describe('req.type(str)', function(){
    it('should set the Content-Type', function(done){
      request
      .post('http://localhost:3000/echo')
      .type('text/x-foo')
      .end(function(res){
        res.header['content-type'].should.equal('text/x-foo');
        done();
      });
    })
    
    it('should map "json"', function(done){
      request
      .post('http://localhost:3000/echo')
      .type('json')
      .end(function(res){
        res.header['content-type'].should.equal('application/json');
        done();
      });
    })
    
    it('should map "html"', function(done){
      request
      .post('http://localhost:3000/echo')
      .type('html')
      .end(function(res){
        res.header['content-type'].should.equal('text/html');
        done();
      });
    })
  })

  describe('req.data(Object)', function(){
    it('should default to json', function(done){
      request
      .post('http://localhost:3000/echo')
      .data({ name: 'tobi' })
      .end(function(res){
        res.header['content-type'].should.equal('application/json');
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })
    
    describe('when called several times', function(){
      it('should merge the objects', function(done){
        request
        .post('http://localhost:3000/echo')
        .data({ name: 'tobi' })
        .data({ age: 1 })
        .end(function(res){
          res.header['content-type'].should.equal('application/json');
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
        });
      })
    })
  })
})