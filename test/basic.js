var should = require('should');
var assert = require('assert');
var url = require('url');

var request = require('../');

var NODE = true;
var uri = 'http://localhost:5000';
if (typeof window !== 'undefined') {
  NODE = false;
  uri = '//' + window.location.host;
}
else {
  process.env.ZUUL_PORT = 5000;
  require('./support/server');
  uri = 'http://localhost:5000';
}

describe('request', function(){

  describe('with a callback', function(){
    it('should invoke .end()', function(done){
      request
      .get(uri + '/login', function(res){
        assert(res.status == 200);
        done();
      })
    })
  })

  describe('.end()', function(){
    it('should issue a request', function(done){
      request
      .get(uri + '/login')
      .end(function(res){
        assert(res.status == 200);
        done();
      });
    })
  })

  describe('res.error', function(){
    it('should should be an Error object', function(done){
      request
      .get(uri + '/error')
      .end(function(res){
        if (NODE) {
          res.error.message.should.equal('cannot GET /error (500)');
        }
        else {
          res.error.message.should.equal('cannot GET ' + uri + '/error (500)');
        }
        res.error.status.should.equal(500);
        done();
      });
    })
  })

  describe('res.header', function(){
    it('should be an object', function(done){
      request
      .get(uri + '/login')
      .end(function(res){
        assert('Express' == res.header['x-powered-by']);
        done();
      });
    })
  })

  describe('res.charset', function(){
    it('should be set when present', function(done){
      request
      .get(uri + '/login')
      .end(function(res){
        res.charset.should.equal('utf-8');
        done();
      });
    })
  })

  describe('res.statusType', function(){
    it('should provide the first digit', function(done){
      request
      .get(uri + '/login')
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
      .get(uri + '/login')
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
      .post(uri + '/echo')
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
      .post(uri + '/echo')
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
      .post(uri + '/echo')
      .type('text/x-foo')
      .end(function(res){
        res.header['content-type'].should.equal('text/x-foo');
        done();
      });
    })

    it('should map "json"', function(done){
      request
      .post(uri + '/echo')
      .type('json')
      .send('{"a": 1}')
      .end(function(res){
        res.should.be.json;
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .post(uri + '/echo')
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
      .get(uri + '/echo')
      .accept('text/x-foo')
      .end(function(res){
         res.header['accept'].should.equal('text/x-foo');
         done();
      });
    })

    it('should map "json"', function(done){
      request
      .get(uri + '/echo')
      .accept('json')
      .end(function(res){
        res.header['accept'].should.equal('application/json');
        done();
      });
    })

    it('should map "xml"', function(done){
      request
      .get(uri + '/echo')
      .accept('xml')
      .end(function(res){
        res.header['accept'].should.equal('application/xml');
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .get(uri + '/echo')
      .accept('html')
      .end(function(res){
        res.header['accept'].should.equal('text/html');
        done();
      });
    })
  })

  describe('req.send(str)', function(){
    it('should write the string', function(done){
      request
      .post(uri + '/echo')
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
      .post(uri + '/echo')
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
        .post(uri + '/echo')
        .send({ name: 'tobi' })
        .send({ age: 1 })
        .end(function(res){
          res.should.be.json
          if (NODE) {
            res.buffered.should.be.true;
          }
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
        });
      })
    })
  })

  describe('.end(fn)', function(){
    it('should check arity', function(done){
      request
      .post(uri + '/echo')
      .send({ name: 'tobi' })
      .end(function(err, res){
        assert(null == err);
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })

    it('should emit request', function(done){
      var req = request.post(uri + '/echo');
      req.on('request', function(request){
        assert(req == request);
        done();
      });
      req.end();
    })

    it('should emit response', function(done){
      request
      .post(uri + '/echo')
      .send({ name: 'tobi' })
      .on('response', function(res){
        res.text.should.equal('{"name":"tobi"}');
        done();
      })
      .end();
    })
  })
})
