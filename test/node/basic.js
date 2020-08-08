'use strict';

const assert = require('assert');
const fs = require('fs');
const { EventEmitter } = require('events');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const setup = require('../support/setup');
const request = require('../support/client');

const base = setup.uri;

const doesntWorkInHttp2 = !process.env.HTTP2_TEST;

describe('[node] request', () => {
  describe('with an url', () => {
    it('should preserve the encoding of the url', (done) => {
      request.get(`${base}/url?a=(b%29`).end((err, res) => {
        assert.equal('/url?a=(b%29', res.text);
        done();
      });
    });
  });

  describe('with an object', () => {
    it('should format the url', () =>
      request.get(url.parse(`${base}/login`)).then((res) => {
        assert(res.ok);
      }));
  });

  describe('without a schema', () => {
    it('should default to http', () =>
      request.get('localhost:5000/login').then((res) => {
        assert.equal(res.status, 200);
      }));
  });

  describe('res.toJSON()', () => {
    it('should describe the response', () =>
      request
        .post(`${base}/echo`)
        .send({ foo: 'baz' })
        .then((res) => {
          const obj = res.toJSON();
          assert.equal('object', typeof obj.header);
          assert.equal('object', typeof obj.req);
          assert.equal(200, obj.status);
          assert.equal('{"foo":"baz"}', obj.text);
        }));
  });

  describe('res.links', () => {
    it('should default to an empty object', () =>
      request.get(`${base}/login`).then((res) => {
        res.links.should.eql({});
      }));

    it('should parse the Link header field', (done) => {
      request.get(`${base}/links`).end((err, res) => {
        res.links.next.should.equal(
          'https://api.github.com/repos/visionmedia/mocha/issues?page=2'
        );
        done();
      });
    });
  });

  describe('req.unset(field)', () => {
    it('should remove the header field', (done) => {
      request
        .post(`${base}/echo`)
        .unset('User-Agent')
        .end((err, res) => {
          assert.equal(void 0, res.header['user-agent']);
          done();
        });
    });
  });

  describe('case-insensitive', () => {
    it('should set/get header fields case-insensitively', () => {
      const r = request.post(`${base}/echo`);
      r.set('MiXeD', 'helloes');
      assert.strictEqual(r.get('mixed'), 'helloes');
    });

    it('should unset header fields case-insensitively', () => {
      const r = request.post(`${base}/echo`);
      r.set('MiXeD', 'helloes');
      r.unset('MIXED');
      assert.strictEqual(r.get('mixed'), undefined);
    });
  });

  describe('req.write(str)', () => {
    it('should write the given data', (done) => {
      const req = request.post(`${base}/echo`);
      req.set('Content-Type', 'application/json');
      assert.equal('boolean', typeof req.write('{"name"'));
      assert.equal('boolean', typeof req.write(':"tobi"}'));
      req.end((err, res) => {
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    });
  });

  describe('req.pipe(stream)', () => {
    it('should pipe the response to the given stream', (done) => {
      const stream = new EventEmitter();

      stream.buf = '';
      stream.writable = true;

      stream.write = function (chunk) {
        this.buf += chunk;
      };

      stream.end = function () {
        this.buf.should.equal('{"name":"tobi"}');
        done();
      };

      request.post(`${base}/echo`).send('{"name":"tobi"}').pipe(stream);
    });
  });

  describe('.buffer()', () => {
    it('should enable buffering', (done) => {
      request
        .get(`${base}/custom`)
        .buffer()
        .end((err, res) => {
          assert.ifError(err);
          assert.equal('custom stuff', res.text);
          assert(res.buffered);
          done();
        });
    });
    it("should take precedence over request.buffer['someMimeType'] = false", (done) => {
      const type = 'application/barbaz';
      const send = 'some text';
      request.buffer[type] = false;
      request
        .post(`${base}/echo`)
        .type(type)
        .send(send)
        .buffer()
        .end((err, res) => {
          delete request.buffer[type];
          assert.ifError(err);
          assert.equal(res.type, type);
          assert.equal(send, res.text);
          assert(res.buffered);
          done();
        });
    });
  });

  describe('.buffer(false)', () => {
    it('should disable buffering', (done) => {
      request
        .post(`${base}/echo`)
        .type('application/x-dog')
        .send('hello this is dog')
        .buffer(false)
        .end((err, res) => {
          assert.ifError(err);
          assert.equal(null, res.text);
          res.body.should.eql({});
          let buf = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            buf += chunk;
          });
          res.on('end', () => {
            buf.should.equal('hello this is dog');
            done();
          });
        });
    });
    it("should take precedence over request.buffer['someMimeType'] = true", (done) => {
      const type = 'application/foobar';
      const send = 'hello this is a dog';
      request.buffer[type] = true;
      request
        .post(`${base}/echo`)
        .type(type)
        .send(send)
        .buffer(false)
        .end((err, res) => {
          delete request.buffer[type];
          assert.ifError(err);
          assert.equal(null, res.text);
          assert.equal(res.type, type);
          assert(!res.buffered);
          res.body.should.eql({});
          let buf = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            buf += chunk;
          });
          res.on('end', () => {
            buf.should.equal(send);
            done();
          });
        });
    });
  });

  describe('.withCredentials()', () => {
    it('should not throw an error when using the client-side "withCredentials" method', (done) => {
      request
        .get(`${base}/custom`)
        .withCredentials()
        .end((err, res) => {
          assert.ifError(err);
          done();
        });
    });
  });

  describe('.agent()', () => {
    it('should return the defaut agent', (done) => {
      const req = request.post(`${base}/echo`);
      req.agent().should.equal(false);
      done();
    });
  });

  describe('.agent(undefined)', () => {
    it('should set an agent to undefined and ensure it is chainable', (done) => {
      const req = request.get(`${base}/echo`);
      const ret = req.agent(undefined);
      ret.should.equal(req);
      assert.strictEqual(req.agent(), undefined);
      done();
    });
  });

  describe('.agent(new http.Agent())', () => {
    it('should set passed agent', (done) => {
      const http = require('http');
      const req = request.get(`${base}/echo`);
      const agent = new http.Agent();
      const ret = req.agent(agent);
      ret.should.equal(req);
      req.agent().should.equal(agent);
      done();
    });
  });

  describe('with a content type other than application/json or text/*', () => {
    it('should still use buffering', () => {
      return request
        .post(`${base}/echo`)
        .type('application/x-dog')
        .send('hello this is dog')
        .then((res) => {
          assert.equal(null, res.text);
          assert.equal(res.body.toString(), 'hello this is dog');
          res.buffered.should.be.true;
        });
    });
  });

  describe('content-length', () => {
    it('should be set to the byte length of a non-buffer object', (done) => {
      const decoder = new StringDecoder('utf8');
      let img = fs.readFileSync(`${__dirname}/fixtures/test.png`);
      img = decoder.write(img);
      request
        .post(`${base}/echo`)
        .type('application/x-image')
        .send(img)
        .buffer(false)
        .end((err, res) => {
          assert.ifError(err);
          assert(!res.buffered);
          assert.equal(res.header['content-length'], Buffer.byteLength(img));
          done();
        });
    });

    it('should be set to the length of a buffer object', (done) => {
      const img = fs.readFileSync(`${__dirname}/fixtures/test.png`);
      request
        .post(`${base}/echo`)
        .type('application/x-image')
        .send(img)
        .buffer(true)
        .end((err, res) => {
          assert.ifError(err);
          assert(res.buffered);
          assert.equal(res.header['content-length'], img.length);
          done();
        });
    });
  });

  if (doesntWorkInHttp2)
    it('should send body with .get().send()', (next) => {
      request
        .get(`${base}/echo`)
        .set('Content-Type', 'text/plain')
        .send('wahoo')
        .end((err, res) => {
          try {
            assert.equal('wahoo', res.text);
            next();
          } catch (err_) {
            next(err_);
          }
        });
    });
});
