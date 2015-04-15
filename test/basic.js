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
      .get(uri + '/login', function(err, res){
        assert(res.status == 200);
        done();
      })
    })
  })

  describe('.clone()', function() {
    it('', function(next) {
      var clone = request('GET', uri + '/ok').clone();
      assert(clone.method === 'GET', 'includes method');
      assert(clone.url === uri + '/ok', 'includes url');
      next();
    });

    it('should end after original ended', function(next) {
      var req = request
                  .post(uri + '/pet')
                  .type('json')
                  .send({ name: 'Manny', species: 'cat' }),
          clone = req.clone();

      // console.log(req.request());
      req.end(function(err, res){
        assert(res.text == 'added Manny the cat', 'with correct result for original');
        clone.end(function(err2, res2) {
          assert(res2.text == 'added Manny the cat', 'with correct result for clone');
          next();
        });
      });
    });

    it('should end afer clone ended', function(next) {
      var req = request
                  .post(uri + '/pet')
                  .type('json')
                  .send({ name: 'Manny', species: 'cat' }),
          clone = req.clone();

      clone.end(function(err, res) {
        assert(res.text == 'added Manny the cat', 'with correct result for original');
        req.end(function(err2, res2) {
          assert(res2.text == 'added Manny the cat', 'with correct result for clone');
          next();
        });
      });
    });

    it('should transfer querystring', function(next) {
      request
      .get(uri + '/querystring')
      .query({ data: 123 })
      .clone()
      .end(function(err, res){
        assert.deepEqual(res.body, { data: 123 });
        next();
      });
    });

    it('should transfer headers', function(next) {
      request
      .post(uri + '/echo')
      .set('Accept', 'json')
      .clone()
      .end(function(err, res){
        assert(res.header['accept'] == 'json', 'includes headers');
        next();
      });
    });

    it('should transfer headers using type()', function(next) {
      request
      .post(uri + '/echo')
      .type('json')
      .clone()
      .end(function(err, res){
        assert(res.header['content-type'] == 'application/json', 'includes headers');
        next();
      });
    });

    it('should transfer headers using accept()', function(next) {
      request
      .post(uri + '/echo')
      .accept('json')
      .clone()
      .end(function(err, res){
        assert(res.header['accept'] === 'application/json', 'includes headers');
        next();
      });
    });

    it('should transfer JSON body', function(next) {
      request
      .post(uri + '/pet')
      .type('json')
      .send({ name: 'Manny', species: 'cat' })
      .clone()
      .end(function(err, res){
        assert('added Manny the cat' == res.text);
        next();
      });
    });

    it('should transfer urlencoded body', function(next){
      request
      .post(uri + '/pet')
      .type('urlencoded')
      .send({ name: 'Manny', species: 'cat' })
      .clone()
      .end(function(err, res){
        assert('added Manny the cat' == res.text);
        next();
      });
    });
  });

  describe('.end()', function(){
    it('should issue a request', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        assert(res.status == 200);
        done();
      });
    })
  })

  describe('res.error', function(){
    it('should should be an Error object', function(done){
      request
      .get(uri + '/error')
      .end(function(err, res){
        if (NODE) {
          res.error.message.should.equal('cannot GET /error (500)');
        }
        else {
          res.error.message.should.equal('cannot GET ' + uri + '/error (500)');
        }
        assert(res.error.status === 500);
        assert(err, 'should have an error for 500');
        assert.equal(err.message, 'Internal Server Error');
        done();
      });
    })
  })

  describe('res.header', function(){
    it('should be an object', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        assert('Express' == res.header['x-powered-by']);
        done();
      });
    })
  })

  describe('res.charset', function(){
    it('should be set when present', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        res.charset.should.equal('utf-8');
        done();
      });
    })
  })

  describe('res.statusType', function(){
    it('should provide the first digit', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        assert(!err, 'should not have an error for success responses');
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
      .end(function(err, res){
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
      .end(function(err, res){
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
      .end(function(err, res){
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
      .end(function(err, res){
        res.header['content-type'].should.equal('text/x-foo');
        done();
      });
    })

    it('should map "json"', function(done){
      request
      .post(uri + '/echo')
      .type('json')
      .send('{"a": 1}')
      .end(function(err, res){
        res.should.be.json;
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .post(uri + '/echo')
      .type('html')
      .end(function(err, res){
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
      .end(function(err, res){
         res.header['accept'].should.equal('text/x-foo');
         done();
      });
    })

    it('should map "json"', function(done){
      request
      .get(uri + '/echo')
      .accept('json')
      .end(function(err, res){
        res.header['accept'].should.equal('application/json');
        done();
      });
    })

    it('should map "xml"', function(done){
      request
      .get(uri + '/echo')
      .accept('xml')
      .end(function(err, res){
        res.header['accept'].should.equal('application/xml');
        done();
      });
    })

    it('should map "html"', function(done){
      request
      .get(uri + '/echo')
      .accept('html')
      .end(function(err, res){
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
      .end(function(err, res){
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
      .end(function(err, res){
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
        .end(function(err, res){
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

  describe('.abort()', function(){
    it('should abort the request', function(done){
      var req = request
      .get(uri + '/delay/3000')
      .end(function(err, res){
        assert(false, 'should not complete the request');
      });

      req.on('abort', done);

      setTimeout(function() {
        req.abort();
      }, 1000);
    })
  })
})
