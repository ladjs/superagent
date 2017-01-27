'use strict';

var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var assert = require('assert');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var StringDecoder = require('string_decoder').StringDecoder;
var url = require('url');

describe('[node] request', function(){

  describe('with an url', function(){
    it('should preserve the encoding of the url', function(done){
      request
      .get(base + '/url?a=(b%29')
      .end(function(err, res){
        assert.equal('/url?a=(b%29', res.text);
        done();
      })
    })
  })

  describe('with an object', function(){
    it('should format the url', function(){
      return request
      .get(url.parse(base + '/login'))
      .then(function(res){
        assert(res.ok);
      })
    })
  })

  describe('without a schema', function(){
    it('should default to http', function(){
      return request
      .get('localhost:5000/login')
      .then(function(res){
        assert.equal(res.status, 200);
      })
    })
  })

  describe('res.toJSON()', function(){
    it('should describe the response', function(){
      return request
      .post(base + '/echo')
      .send({ foo: 'baz' })
      .then(function(res){
        var obj = res.toJSON();
        assert.equal('object', typeof obj.header);
        assert.equal('object', typeof obj.req);
        assert.equal(200, obj.status);
        assert.equal('{"foo":"baz"}', obj.text);
      });
    });
  })

  describe('res.links', function(){
    it('should default to an empty object', function(){
      return request
      .get(base + '/login')
      .then(function(res){
        res.links.should.eql({});
      })
    })

    it('should parse the Link header field', function(done){
      request
      .get(base + '/links')
      .end(function(err, res){
        res.links.next.should.equal('https://api.github.com/repos/visionmedia/mocha/issues?page=2');
        done();
      })
    })
  })

  describe('req.unset(field)', function(){
    it('should remove the header field', function(done){
      request
      .post(base + '/echo')
      .unset('User-Agent')
      .end(function(err, res){
        assert.equal(void 0, res.header['user-agent']);
        done();
      })
    })
  })

  describe('case-insensitive', function(){
    it('should set/get header fields case-insensitively', function(){
      var r = request.post(base + '/echo');
      r.set('MiXeD', 'helloes');
      assert.strictEqual(r.get('mixed'), 'helloes');
    });

    it('should unset header fields case-insensitively', function () {
      var r = request.post(base + '/echo');
      r.set('MiXeD', 'helloes');
      r.unset('MIXED');
      assert.strictEqual(r.get('mixed'), undefined);
    });
  });

  describe('req.write(str)', function(){
    it('should write the given data', function(done){
      var req = request.post(base + '/echo');
      req.set('Content-Type', 'application/json');
      assert.equal('boolean', typeof req.write('{"name"'));
      assert.equal('boolean', typeof req.write(':"tobi"}'));
      req.end(function(err, res){
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
      .post(base + '/echo')
      .send('{"name":"tobi"}')
      .pipe(stream);
    })
  })

  describe('.buffer()', function(){
    it('should enable buffering', function(done){
      request
      .get(base + '/custom')
      .buffer()
      .end(function(err, res){
        assert.equal(null, err);
        assert.equal('custom stuff', res.text);
        assert(res.buffered);
        done();
      });
    })
  })

  describe('.buffer(false)', function(){
    it('should disable buffering', function(done){
      request
      .post(base + '/echo')
      .type('application/x-dog')
      .send('hello this is dog')
      .buffer(false)
      .end(function(err, res){
        assert.equal(null, err);
        assert.equal(null, res.text);
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

  describe('.withCredentials()', function(){
    it('should not throw an error when using the client-side "withCredentials" method', function(done){
      request
      .get(base + '/custom')
      .withCredentials()
      .end(function(err, res){
        assert.equal(null, err);
        done();
      });
    })
  })

  describe('.agent()', function(){
    it('should return the defaut agent', function(done){
      var req = request.post(base + '/echo');
      req.agent().should.equal(false);
      done();
    })
  })

  describe('.agent(undefined)', function(){
    it('should set an agent to undefined and ensure it is chainable', function(done){
      var req = request.get(base + '/echo');
      var ret = req.agent(undefined);
      ret.should.equal(req);
      assert.strictEqual(req.agent(), undefined);
      done();
    })
  })

  describe('.agent(new http.Agent())', function(){
    it('should set passed agent', function(done){
      var http = require('http');
      var req = request.get(base + '/echo');
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
      .post(base + '/echo')
      .type('application/x-dog')
      .send('hello this is dog')
      .end(function(err, res){
        assert.equal(null, err);
        assert.equal(null, res.text);
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

  describe('content-length', function() {
    it('should be set to the byte length of a non-buffer object', function (done) {
      var decoder = new StringDecoder('utf8');
      var img = fs.readFileSync(__dirname + '/fixtures/test.png');
      img = decoder.write(img);
      request
      .post(base + '/echo')
      .type('application/x-image')
      .send(img)
      .buffer(false)
      .end(function(err, res){
        assert.equal(null, err);
        assert(!res.buffered);
        assert.equal(res.header['content-length'], Buffer.byteLength(img));
        done();
      });
    })

    it('should be set to the length of a buffer object', function(done){
      var img = fs.readFileSync(__dirname + '/fixtures/test.png');
      request
      .post(base + '/echo')
      .type('application/x-image')
      .send(img)
      .buffer(true)
      .end(function(err, res){
        assert.equal(null, err);
        assert(res.buffered);
        assert.equal(res.header['content-length'], img.length);
        done();
      });
    })
  })

  it('should send body with .get().send()', function(next){
    request
    .get(base + '/echo')
    .set('Content-Type', 'text/plain')
    .send('wahoo')
    .end(function(err, res){
    try {
      assert.equal('wahoo', res.text);
      next();
      } catch(e) { next(e); }
    });
  });
});
