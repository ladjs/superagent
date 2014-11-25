
var EventEmitter = require('events').EventEmitter
  , request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

app.get('/login', function(req, res){
  res.status(200).send('<form id="login"></form>');
});

app.all('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.status(200).json({ name: 'manny' });
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
  res.status(200).send('first movie page');
});

app.get('/links', function(req, res){
  res.header('Link', '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next"');
  res.end();
});

app.get('/xml', function(req, res){
  res.type('xml');
  res.status(200).send('<some><xml></xml></some>');
});

app.get('/custom', function(req, res){
  res.type('application/x-custom');
  res.status(200).send('custom stuff');
});

app.get('/error', function(req, res){
  res.status(500).send('boom');
});

app.listen(5000);

describe('request', function(){
  describe('with an object', function(){
    it('should format the url', function(done){
      request
      .get(url.parse('http://localhost:5000/login'))
      .end(function(res){
        assert(res.ok);
        done();
      })
    })
  })

  describe('with a callback', function(){
    it('should invoke .end()', function(done){
      request
      .get('localhost:5000/login', function(res){
        assert(res.status == 200);
        done();
      })
    })
  })

  describe('without a schema', function(){
    it('should default to http', function(done){
      request
      .get('localhost:5000/login')
      .end(function(res){
        assert(res.status == 200);
        done();
      })
    })
  })

  describe('.end()', function(){
    it('should issue a request', function(done){
      request
      .get('http://localhost:5000/login')
      .end(function(res){
        assert(res.status == 200);
        done();
      });
    })
  })

  describe('req.toJSON()', function(){
    it('should describe the request', function(done){
      request
      .post(':5000/echo')
      .send({ foo: 'baz' })
      .end(function(res){
        var obj = res.request.toJSON();
        assert('POST' == obj.method);
        assert(':5000/echo' == obj.url);
        assert('baz' == obj.data.foo);
        done();
      });
    })
  })

  describe('res.toJSON()', function(){
    it('should describe the response', function(done){
      request
      .post(':5000/echo')
      .send({ foo: 'baz' })
      .end(function(res){
        var obj = res.toJSON();
        assert('object' == typeof obj.header);
        assert('object' == typeof obj.req);
        assert(200 == obj.status);
        assert('{"foo":"baz"}' == obj.text);
        done();
      });
    });
  })

  describe('res.error', function(){
    it('should should be an Error object', function(done){
      request
      .get(':5000/error')
      .end(function(res){
        res.error.message.should.equal('cannot GET /error (500)');
        res.error.status.should.equal(500);
        done();
      });
    })
  })

  describe('res.header', function(){
    it('should be an object', function(done){
      request
      .get('http://localhost:5000/login')
      .end(function(res){
        assert('Express' == res.header['x-powered-by']);
        done();
      });
    })
  })

  describe('res.charset', function(){
    it('should be set when present', function(done){
      request
      .get('http://localhost:5000/login')
      .end(function(res){
        res.charset.should.equal('utf-8');
        done();
      });
    })
  })

  describe('res.statusType', function(){
    it('should provide the first digit', function(done){
      request
      .get('http://localhost:5000/login')
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
      .get('http://localhost:5000/login')
      .end(function(res){
        res.type.should.equal('text/html');
        res.charset.should.equal('utf-8');
        done();
      });
    })
  })

  describe('res.links', function(){
    it('should default to an empty object', function(done){
      request
      .get('http://localhost:5000/login')
      .end(function(res){
        res.links.should.eql({});
        done();
      })
    })

    it('should parse the Link header field', function(done){
      request
      .get('http://localhost:5000/links')
      .end(function(res){
        res.links.next.should.equal('https://api.github.com/repos/visionmedia/mocha/issues?page=2');
        done();
      })
    })
  })

  describe('req.set(field, val)', function(){
    it('should set the header field', function(done){
      request
      .post('http://localhost:5000/echo')
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
      .post('http://localhost:5000/echo')
      .set({ 'X-Foo': 'bar', 'X-Bar': 'baz' })
      .end(function(res){
        assert('bar' == res.header['x-foo']);
        assert('baz' == res.header['x-bar']);
        done();
      })
    })
  })

  describe('req.unset(field)', function(){
    it('should remove the header field', function(done){
      request
      .post('http://localhost:5000/echo')
      .unset('User-Agent')
      .end(function(res){
        assert(void 0 == res.header['user-agent']);
        done();
      })
    })
  })

  describe('req.type(str)', function(){
    it('should set the Content-Type', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('text/x-foo')
      .end(function(res){
        res.header['content-type'].should.equal('text/x-foo');
        done();
      });
    })

    it('should map "json"', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('json')
      .send('{"a": 1}')
      .end(function(res){
        res.should.be.json;
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('html')
      .end(function(res){
        res.header['content-type'].should.equal('text/html');
        done();
      });
    })
  })

  describe('req.accept(str)', function(){
    it('should set Accept', function(done){
      request
      .get('http://localhost:5000/echo')
      .accept('text/x-foo')
      .end(function(res){
         res.header['accept'].should.equal('text/x-foo');
         done();
      });
    })

    it('should map "json"', function(done){
      request
      .get('http://localhost:5000/echo')
      .accept('json')
      .end(function(res){
        res.header['accept'].should.equal('application/json');
        done();
      });
    })

    it('should map "xml"', function(done){
      request
      .get('http://localhost:5000/echo')
      .accept('xml')
      .end(function(res){
        res.header['accept'].should.equal('application/xml');
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .get('http://localhost:5000/echo')
      .accept('html')
      .end(function(res){
        res.header['accept'].should.equal('text/html');
        done();
      });
    })
  })

  describe('req.write(str)', function(){
    it('should write the given data', function(done){
      var req = request.post('http://localhost:5000/echo');
      req.set('Content-Type', 'application/json');
      req.write('{"name"').should.be.a.boolean;
      req.write(':"tobi"}').should.be.a.boolean;
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
      .post('http://localhost:5000/echo')
      .send('{"name":"tobi"}')
      .pipe(stream);
    })
  })

  describe('req.send(str)', function(){
    it('should write the string', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('json')
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
      .post('http://localhost:5000/echo')
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
        .post('http://localhost:5000/echo')
        .send({ name: 'tobi' })
        .send({ age: 1 })
        .end(function(res){
          res.should.be.json
          res.buffered.should.be.true;
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
        });
      })
    })
  })

  describe('.end(fn)', function(){
    it('should check arity', function(done){
      request
      .post('http://localhost:5000/echo')
      .send({ name: 'tobi' })
      .end(function(err, res){
        assert(null == err);
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })

    it('should emit request', function(done){
      var req = request.post('http://localhost:5000/echo');
      req.on('request', function(request){
        assert(req == request);
        done();
      });
      req.end();
    })

    it('should emit response', function(done){
      request
      .post('http://localhost:5000/echo')
      .send({ name: 'tobi' })
      .on('response', function(res){
        res.text.should.equal('{"name":"tobi"}');
        done();
      })
      .end();
    })
  })

  describe('.buffer()', function(){
    it('should enable buffering', function(done){
      request
      .get('http://localhost:5000/custom')
      .buffer()
      .end(function(err, res){
        assert(null == err);
        assert('custom stuff' == res.text);
        assert(res.buffered);
        done();
      });
    })
  })

  describe('.buffer(false)', function(){
    it('should disable buffering', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('application/x-dog')
      .send('hello this is dog')
      .buffer(false)
      .end(function(err, res){
        assert(null == err);
        assert(null == res.text);
        res.body.should.eql({});
        var buf = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk){ buf += chunk });
        res.on('end', function(){
          buf.should.equal('hello this is dog');
          done();
        });
      });
    })
  })

  describe('.agent()', function(){
    it('should return the defaut agent', function(done){
      var req = request.post('http://localhost:5000/echo');
      req.agent().should.equal(false);
      done();
    })
  })

  describe('.agent(undefined)', function(){
    it('should set an agent to undefined and ensure it is chainable', function(done){
      var req = request.get();
      var ret = req.agent(undefined);
      ret.should.equal(req);
      assert(req.agent() === undefined);
      done();
    })
  })

  describe('.agent(new http.Agent())', function(){
    it('should set passed agent', function(done){
      var http = require('http');
      var req = request.get();
      var agent = new http.Agent();
      var ret = req.agent(agent);
      ret.should.equal(req);
      req.agent().should.equal(agent)
      done();
    })
  })

  describe('with a content type other than application/json or text/*', function(){
    it('should disable buffering', function(done){
      request
      .post('http://localhost:5000/echo')
      .type('application/x-dog')
      .send('hello this is dog')
      .end(function(err, res){
        assert(null == err);
        assert(null == res.text);
        res.body.should.eql({});
        var buf = '';
        res.setEncoding('utf8');
        res.buffered.should.be.false;
        res.on('data', function(chunk){ buf += chunk });
        res.on('end', function(){
          buf.should.equal('hello this is dog');
          done();
        });
      });
    })
  })
})
