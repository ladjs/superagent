
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer()
  , url = require('url');

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.get('/', function(req, res){
  res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.send('first movie page');
});

app.listen(3000);

// TODO: "response" event should be a Response

describe('request', function(){
  describe('with an object', function(){
    it('should format the url', function(done){
      request
      .get(url.parse('http://localhost:3000/login'))
      .end(function(res){
        assert(res.ok);
        done();
      })
    })
  })

  describe('without a schema', function(){
    it('should default to http', function(done){
      request
      .get('localhost:3000/login')
      .end(function(res){
        assert(res.status == 200);
        done();
      })
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

  describe('res.charset', function(){
    it('should be set when present', function(done){
      request
      .get('http://localhost:3000/login')
      .end(function(res){
        res.charset.should.equal('utf-8');
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

  describe('res.type', function(){
    it('should provide the mime-type void of params', function(done){
      request
      .get('http://localhost:3000/login')
      .end(function(res){
        res.type.should.equal('text/html');
        res.charset.should.equal('utf-8');
        done();
      });
    })
  })

  describe('req.set(field, val)', function(){
    it('should set the header field', function(done){
      request
      .post('http://localhost:3000/echo')
      .set('X-Foo', 'bar')
      .set('X-Bar', 'baz')
      .end(function(res){
        assert('bar' == res.header['x-foo']);
        assert('baz' == res.header['x-bar']);
        done();
      })
    })
  })
  
  describe('req.set(obj)', function(){
    it('should set the header fields', function(done){
      request
      .post('http://localhost:3000/echo')
      .set({ 'X-Foo': 'bar', 'X-Bar': 'baz' })
      .end(function(res){
        assert('bar' == res.header['x-foo']);
        assert('baz' == res.header['x-bar']);
        done();
      })
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
        res.should.be.json
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

  describe('req.write(str)', function(){
    it('should write the given data', function(done){
      var req = request.post('http://localhost:3000/echo');
      req.write('{"name"').should.be.a('boolean');
      req.write(':"tobi"}').should.be.a('boolean');
      req.end(function(res){
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })
  })

  describe('req.pipe(stream)', function(){
    it('should pipe the response to the given stream', function(done){
      var stream = new EventEmitter;

      stream.buf = '';
      stream.writable = true;

      stream.write = function(chunk){
        this.buf += chunk;
      };

      stream.end = function(){
        this.buf.should.equal('{"name":"tobi"}');
        done();
      };

      request
      .post('http://localhost:3000/echo')
      .send('{"name":"tobi"}')
      .pipe(stream);
    })
  })

  describe('req.send(str)', function(){
    it('should write the string', function(done){
      request
      .post('http://localhost:3000/echo')
      .send('{"name":"tobi"}')
      .end(function(res){
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })
  })

  describe('req.send(Object)', function(){
    it('should default to json', function(done){
      request
      .post('http://localhost:3000/echo')
      .send({ name: 'tobi' })
      .end(function(res){
        res.should.be.json
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })
    
    describe('when called several times', function(){
      it('should merge the objects', function(done){
        request
        .post('http://localhost:3000/echo')
        .send({ name: 'tobi' })
        .send({ age: 1 })
        .end(function(res){
          res.should.be.json
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
        });
      })
    })
  })
})