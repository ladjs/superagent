var setup = require('./support/setup');
var NODE = setup.NODE;
var uri = setup.uri;

var assert = require('assert');
var request = require('../');

describe('request', function(){
  this.timeout(20000);

  describe('res.statusCode', function(){
    it('should set statusCode', function(done){
      request
      .get(uri + '/login', function(err, res){
        try {
        assert.strictEqual(res.statusCode, 200);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('should allow the send shorthand', function() {
    it('with callback in the method call', function(done) {
      request
      .get(uri + '/login', function(err, res) {
          assert.equal(res.status, 200);
          done();
      });
    })

    it('with data in the method call', function(done) {
      request
      .post(uri + '/echo', { foo: 'bar' })
      .end(function(err, res) {
        assert.equal('{"foo":"bar"}', res.text);
        done();
      });
    })

    it('with callback and data in the method call', function(done) {
      request
      .post(uri + '/echo', { foo: 'bar' }, function(err, res) {
        assert.equal('{"foo":"bar"}', res.text);
        done();
      });
    })
  })

  describe('with a callback', function(){
    it('should invoke .end()', function(done){
      request
      .get(uri + '/login', function(err, res){
        try {
        assert.equal(res.status, 200);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('.end()', function(){
    it('should issue a request', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        try {
        assert.equal(res.status, 200);
        done();
        } catch(e) { done(e); }
      });
    })

    it('is optional with a promise', function() {
      if ('undefined' === typeof Promise) {
        return;
      }

      return request.get(uri + '/login')
      .then(function(res) {
          return res.status;
      })
      .then()
      .then(function(status) {
          assert.equal(200, status, "Real promises pass results through");
      });
    });

    it('called only once with a promise', function() {
      if ('undefined' === typeof Promise) {
        return;
      }

      var req = request.get(uri + '/unique');

      return Promise.all([req, req, req])
      .then(function(results){
        results.forEach(function(item){
          assert.equal(item.body, results[0].body, "It should keep returning the same result after being called once");
        });
      });
    });
  })


  describe('res.error', function(){
    it('ok', function(done){
      var calledErrorEvent = false;
      var calledOKHandler = false;
      request
      .get(uri + '/error')
      .ok(function(res){
        assert.strictEqual(500, res.status);
        calledOKHandler = true;
        return true;
      })
      .on('error', function(err){
        calledErrorEvent = true;
      })
      .end(function(err, res){
        try{
          assert.ifError(err);
          assert.strictEqual(res.status, 500);
          assert(!calledErrorEvent);
          assert(calledOKHandler);
          done();
        } catch(e) { done(e); }
      });
    });

    it('should should be an Error object', function(done){
      var calledErrorEvent = false;
      request
      .get(uri + '/error')
      .on('error', function(err){
        assert.strictEqual(err.status, 500);
        calledErrorEvent = true;
      })
      .end(function(err, res){
        try {
        if (NODE) {
          res.error.message.should.equal('cannot GET /error (500)');
        }
        else {
          res.error.message.should.equal('cannot GET ' + uri + '/error (500)');
        }
        assert.strictEqual(res.error.status, 500);
        assert(err, 'should have an error for 500');
        assert.equal(err.message, 'Internal Server Error');
        assert(calledErrorEvent);
        done();
        } catch(e) { done(e); }
      });
    })

    it('with .then() promise', function(){
      if ('undefined' === typeof Promise) {
        return;
      }

      return request
      .get(uri + '/error')
      .then(function(){
        assert.fail();
      }, function(err){
        assert.equal(err.message, 'Internal Server Error');
      });
    })

    it('with .ok() returning false', function(){
      if ('undefined' === typeof Promise) {
        return;
      }

      return request
      .get(uri + '/echo')
      .ok(function() {return false;})
      .then(function(){
        assert.fail();
      }, function(err){
        assert.equal(200, err.response.status);
        assert.equal(err.message, 'OK');
      });
    })
  })

  describe('res.header', function(){
    it('should be an object', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        try {
        assert.equal('Express', res.header['x-powered-by']);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('set headers', function() {
    before(function() {
      Object.prototype.invalid = '\n';
    });

    after(function() {
      delete Object.prototype.invalid;
    });

    it('should only set headers for ownProperties of header', function(done) {
      try {
        request
          .get(uri + '/echo')
          .end(done);
      } catch (e) {
        done(e)
      }
    });
  });

  describe('res.charset', function(){
    it('should be set when present', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        try {
        res.charset.should.equal('utf-8');
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('res.statusType', function(){
    it('should provide the first digit', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        try {
        assert(!err, 'should not have an error for success responses');
        assert.equal(200, res.status);
        assert.equal(2, res.statusType);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('res.type', function(){
    it('should provide the mime-type void of params', function(done){
      request
      .get(uri + '/login')
      .end(function(err, res){
        try {
        res.type.should.equal('text/html');
        res.charset.should.equal('utf-8');
        done();
        } catch(e) { done(e); }
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
        try {
        assert.equal('bar', res.header['x-foo']);
        assert.equal('baz', res.header['x-bar']);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('req.set(obj)', function(){
    it('should set the header fields', function(done){
      request
      .post(uri + '/echo')
      .set({ 'X-Foo': 'bar', 'X-Bar': 'baz' })
      .end(function(err, res){
        try {
        assert.equal('bar', res.header['x-foo']);
        assert.equal('baz', res.header['x-bar']);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('req.type(str)', function(){
    it('should set the Content-Type', function(done){
      request
      .post(uri + '/echo')
      .type('text/x-foo')
      .end(function(err, res){
        try {
        res.header['content-type'].should.equal('text/x-foo');
        done();
        } catch(e) { done(e); }
      });
    })

    it('should map "json"', function(done){
      request
      .post(uri + '/echo')
      .type('json')
      .send('{"a": 1}')
      .end(function(err, res){
        try {
        res.should.be.json();
        done();
        } catch(e) { done(e); }
      });
    })

    it('should map "html"', function(done){
      request
      .post(uri + '/echo')
      .type('html')
      .end(function(err, res){
        try {
        res.header['content-type'].should.equal('text/html');
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('req.accept(str)', function(){
    it('should set Accept', function(done){
      request
      .get(uri + '/echo')
      .accept('text/x-foo')
      .end(function(err, res){
        try {
         res.header['accept'].should.equal('text/x-foo');
         done();
        } catch(e) { done(e); }
      });
    })

    it('should map "json"', function(done){
      request
      .get(uri + '/echo')
      .accept('json')
      .end(function(err, res){
        try {
        res.header['accept'].should.equal('application/json');
        done();
        } catch(e) { done(e); }
      });
    })

    it('should map "xml"', function(done){
      request
      .get(uri + '/echo')
      .accept('xml')
      .end(function(err, res){
        try {
        res.header['accept'].should.equal('application/xml');
        done();
        } catch(e) { done(e); }
      });
    })

    it('should map "html"', function(done){
      request
      .get(uri + '/echo')
      .accept('html')
      .end(function(err, res){
        try {
        res.header['accept'].should.equal('text/html');
        done();
        } catch(e) { done(e); }
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
        try {
        res.text.should.equal('{"name":"tobi"}');
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('req.send(Object)', function(){
    it('should default to json', function(done){
      request
      .post(uri + '/echo')
      .send({ name: 'tobi' })
      .end(function(err, res){
        try {
        res.should.be.json();
        res.text.should.equal('{"name":"tobi"}');
        done();
        } catch(e) { done(e); }
      });
    })

    describe('when called several times', function(){
      it('should merge the objects', function(done){
        request
        .post(uri + '/echo')
        .send({ name: 'tobi' })
        .send({ age: 1 })
        .end(function(err, res){
            try {
          res.should.be.json();
          if (NODE) {
            res.buffered.should.be.true();
          }
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
          } catch(e) { done(e); }
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
        try {
        assert.equal(null, err);
        res.text.should.equal('{"name":"tobi"}');
        done();
        } catch(e) { done(e); }
      });
    })

    it('should emit request', function(done){
      var req = request.post(uri + '/echo');
      req.on('request', function(request){
        assert.equal(req, request);
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

  describe('.then(fulfill, reject)', function() {
    it('should support successful fulfills with .then(fulfill)', function(done) {
      if ('undefined' === typeof Promise) {
        return done();
      }

      request
      .post(uri + '/echo')
      .send({ name: 'tobi' })
      .then(function(res) {
        res.text.should.equal('{"name":"tobi"}');
        done();
      })
    })

    it('should reject an error with .then(null, reject)', function(done) {
      if ('undefined' === typeof Promise) {
        return done();
      }

      request
      .get(uri + '/error')
      .then(null, function(err) {
        assert.equal(err.status, 500);
        assert.equal(err.response.text, 'boom');
        done();
      })
    })
  })

  describe('.catch(reject)', function() {
    it('should reject an error with .catch(reject)', function(done) {
      if ('undefined' === typeof Promise) {
        return done();
      }

      request
      .get(uri + '/error')
      .catch(function(err) {
        assert.equal(err.status, 500);
        assert.equal(err.response.text, 'boom');
        done();
      })
    })
  })

  describe('.abort()', function(){
    it('should abort the request', function(done){
      var req = request
      .get(uri + '/delay/3000')
      .end(function(err, res){
        try {
        assert(false, 'should not complete the request');
        } catch(e) { done(e); }
    });

      req.on('error', function(error){
        done(error);
      });
      req.on('abort', done);

      setTimeout(function() {
        req.abort();
      }, 500);
    })

    it('should allow chaining .abort() several times', function(done){
      var req = request
      .get(uri + '/delay/3000')
      .end(function(err, res){
        try {
        assert(false, 'should not complete the request');
        } catch(e) { done(e); }
      });

      // This also verifies only a single 'done' event is emitted
      req.on('abort', done);

      setTimeout(function() {
        req.abort().abort().abort();
      }, 1000);
    })
  })

  describe('req.toJSON()', function(){
    it('should describe the request', function(done){
      var req = request
      .post(uri + '/echo')
      .send({ foo: 'baz' })
      .end(function(err, res){
        try {
        var json = req.toJSON();
        assert.equal('POST', json.method);
        assert(/\/echo$/.test(json.url));
        assert.equal('baz', json.data.foo);
        done();
        } catch(e) { done(e); }
      });
    })
  })

  describe('req.options()', function(){
    it('should allow request body', function(done){
      request.options(uri + '/options/echo/body')
      .send({ foo: 'baz' })
      .end(function(err, res){
        try {
        assert.equal(err, null);
        assert.strictEqual(res.body.foo, 'baz');
        done();
        } catch(e) { done(e); }
      });
    });
  });

  describe('req.sortQuery()', function(){
    it('nop with no querystring', function(done){
      request
      .get(uri + '/url')
      .sortQuery()
      .end(function(err, res){
        try {
        assert.equal(res.text, '/url')
        done();
        } catch(e) { done(e); }
      });
    });

    it('should sort the request querystring', function(done){
      request
      .get(uri + '/url')
      .query('search=Manny')
      .query('order=desc')
      .sortQuery()
      .end(function(err, res){
        try {
        assert.equal(res.text, '/url?order=desc&search=Manny')
        done();
        } catch(e) { done(e); }
      });
    });

    it('should allow disabling sorting', function(done){
      request
      .get(uri + '/url')
      .query('search=Manny')
      .query('order=desc')
      .sortQuery() // take default of true
      .sortQuery(false) // override it in later call
      .end(function(err, res){
        try {
        assert.equal(res.text, '/url?search=Manny&order=desc')
        done();
        } catch(e) { done(e); }
      });
    });

    it('should sort the request querystring using customized function', function(done) {
      request
      .get(uri + '/url')
      .query('name=Nick')
      .query('search=Manny')
      .query('order=desc')
      .sortQuery(function(a, b){
        return a.length - b.length;
      })
      .end(function(err, res){
        try {
        assert.equal(res.text, '/url?name=Nick&order=desc&search=Manny')
        done();
        } catch(e) { done(e); }
      });
    });
  })
})
