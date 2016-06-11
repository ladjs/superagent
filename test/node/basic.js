var EventEmitter = require('events').EventEmitter;
var assert = require('better-assert');
var fs = require('fs');
var StringDecoder = require('string_decoder').StringDecoder;
var url = require('url');

var request = require('../../');

describe('[node] request', function(){

  describe('with an url', function(){
    it('should preserve the encoding of the url', function(done){
      request
      .get('http://localhost:5000/url?a=(b%29')
      .end(function(err, res){
        assert('/url?a=(b%29' == res.text);
        done();
      })
    })
  })

  describe('with an object', function(){
    it('should format the url', function(done){
      request
      .get(url.parse('http://localhost:5000/login'))
      .end(function(err, res){
        assert(res.ok);
        done();
      })
    })
  })

  describe('without a schema', function(){
    it('should default to http', function(done){
      request
      .get('localhost:5000/login')
      .end(function(err, res){
        assert(res.status == 200);
        done();
      })
    })
  })

  describe('res.toJSON()', function(){
    it('should describe the response', function(done){
      request
      .post('http://localhost:5000/echo')
      .send({ foo: 'baz' })
      .end(function(err, res){
        var obj = res.toJSON();
        assert('object' == typeof obj.header);
        assert('object' == typeof obj.req);
        assert(200 == obj.status);
        assert('{"foo":"baz"}' == obj.text);
        done();
      });
    });
  })

  describe('res.links', function(){
    it('should default to an empty object', function(done){
      request
      .get('http://localhost:5000/login')
      .end(function(err, res){
        res.links.should.eql({});
        done();
      })
    })

    it('should parse the Link header field', function(done){
      request
      .get('http://localhost:5000/links')
      .end(function(err, res){
        res.links.next.should.equal('https://api.github.com/repos/visionmedia/mocha/issues?page=2');
        done();
      })
    })
  })

  describe('req.unset(field)', function(){
    it('should remove the header field', function(done){
      request
      .post('http://localhost:5000/echo')
      .unset('User-Agent')
      .end(function(err, res){
        assert(void 0 == res.header['user-agent']);
        done();
      })
    })
  })

  describe('case-insensitive', function(){
    it('should set/get header fields case-insensitively', function(){
      var r = request.post('http://localhost:5000/echo');
      r.set('MiXeD', 'helloes');
      assert(r.get('mixed') === 'helloes');
    });

    it('should unset header fields case-insensitively', function () {
      var r = request.post('http://localhost:5000/echo');
      r.set('MiXeD', 'helloes');
      r.unset('MIXED');
      assert(r.get('mixed') === undefined);
    });
  });

  describe('req.write(str)', function(){
    it('should write the given data', function(done){
      var req = request.post('http://localhost:5000/echo');
      req.set('Content-Type', 'application/json');
      req.write('{"name"').should.be.a.boolean;
      req.write(':"tobi"}').should.be.a.boolean;
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
      .post('http://localhost:5000/echo')
      .send('{"name":"tobi"}')
      .pipe(stream);
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

  describe('.withCredentials()', function(){
    it('should not throw an error when using the client-side "withCredentials" method', function(done){
      request
      .get('http://localhost:5000/custom')
      .withCredentials()
      .end(function(err, res){
        assert(null == err);
        done();
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
      var req = request.get('http://localhost:5000/echo');
      var ret = req.agent(undefined);
      ret.should.equal(req);
      assert(req.agent() === undefined);
      done();
    })
  })

  describe('.agent(new http.Agent())', function(){
    it('should set passed agent', function(done){
      var http = require('http');
      var req = request.get('http://localhost:5000/echo');
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

  describe('content-length', function() {
    it('should be set to the byte length of a non-buffer object', function (done) {
      var decoder = new StringDecoder('utf8');
      var img = fs.readFileSync(__dirname + '/fixtures/test.png');
      img = decoder.write(img);
      request
      .post('http://localhost:5000/echo')
      .type('application/x-image')
      .send(img)
      .buffer(false)
      .end(function(err, res){
        assert(null == err);
        assert(!res.buffered);
        assert(res.header['content-length'] == Buffer.byteLength(img));
        done();
      });
    })

    it('should be set to the length of a buffer object', function(done){
      var img = fs.readFileSync(__dirname + '/fixtures/test.png');
      request
      .post('http://localhost:5000/echo')
      .type('application/x-image')
      .send(img)
      .buffer(true)
      .end(function(err, res){
        assert(null == err);
        assert(res.buffered);
        assert(res.header['content-length'] == img.length);
        done();
      });
    })
  })
});
