'use strict';

const assert = require('assert');
const fs = require('fs');
const { EventEmitter } = require('events');
const { StringDecoder } = require('string_decoder');
const url = require('url');
const getSetup = require('../support/setup');
const request = require('../support/client');

const doesntWorkInHttp2 = !process.env.HTTP2_TEST;

describe('[node] request', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('with an url', () => {
    it('should preserve the encoding of the url', (done) => {
      request.get(`${base}/url?a=(b%29`).end((error, res) => {
        assert.equal('/url?a=(b%29', res.text);
        done();
      });
    });
  });

  describe('with an object', () => {
    it('should format the url', () =>
      request.get(url.parse(`${base}/login`)).then((res) => {
        assert.ok(res.ok);
      }));
  });

  describe('without a schema', () => {
    it('should default to http', () =>
      request.get(`${base}/login`).then((res) => {
        assert.equal(res.status, 200);
      }));
  });

  describe('res.toJSON()', () => {
    it('should describe the response', () =>
      request
        .post(`${base}/echo`)
        .send({ foo: 'baz' })
        .then((res) => {
          const object = res.toJSON();
          assert.equal('object', typeof object.header);
          assert.equal('object', typeof object.req);
          assert.equal(200, object.status);
          assert.equal('{"foo":"baz"}', object.text);
        }));
  });

  describe('res.links', () => {
    it('should default to an empty object', () =>
      request.get(`${base}/login`).then((res) => {
        assert.deepEqual(res.links, {});
      }));

    it('should parse the Link header field', (done) => {
      request.get(`${base}/links`).end((error, res) => {
        assert.equal(
          res.links.next,
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
        .end((error, res) => {
          assert.equal(res.header['user-agent'], undefined);
          done();
        });
    });
  });

  describe('case-insensitive', () => {
    it('should set/get header fields case-insensitively', () => {
      const req = request.post(`${base}/echo`);
      req.set('MiXeD', 'helloes');
      assert.strictEqual(req.get('mixed'), 'helloes');
    });

    it('should unset header fields case-insensitively', () => {
      const req = request.post(`${base}/echo`);
      req.set('MiXeD', 'helloes');
      req.unset('MIXED');
      assert.strictEqual(req.get('mixed'), undefined);
    });
  });

  describe('req.write(str)', () => {
    it('should write the given data', (done) => {
      const request_ = request.post(`${base}/echo`);
      request_.set('Content-Type', 'application/json');
      assert.equal('boolean', typeof request_.write('{"name"'));
      assert.equal('boolean', typeof request_.write(':"tobi"}'));
      request_.end((error, res) => {
        assert.equal(res.text, '{"name":"tobi"}');
        done();
      });
    });
  });

  describe('req.pipe(stream)', () => {
    it('should pipe the response to the given stream', (done) => {
      const stream = new EventEmitter();

      let buf = '';
      stream.writable = true;

      stream.write = function (chunk) {
        buf += chunk;
      };

      stream.end = function () {
        assert.equal(buf, '{"name":"tobi"}');
        done();
      };

      request.post(`${base}/echo`)
        .send('{"name":"tobi"}')
        .pipe(stream);
    });
  });

  describe('.buffer()', () => {
    it('should enable buffering', (done) => {
      request
        .get(`${base}/custom`)
        .buffer()
        .end((error, res) => {
          assert.ifError(error);
          assert.equal('custom stuff', res.text);
          assert.ok(res.buffered);
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
        .end((error, res) => {
          delete request.buffer[type];
          assert.ifError(error);
          assert.equal(res.type, type);
          assert.equal(send, res.text);
          assert.ok(res.buffered);
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
        .end((error, res) => {
          assert.ifError(error);
          assert.equal(null, res.text);
          assert.deepEqual(res.body, {});
          let str = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            str += chunk;
          });
          res.on('end', () => {
            assert.equal(str, 'hello this is dog');
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
        .end((error, res) => {
          delete request.buffer[type];
          assert.ifError(error);
          assert.equal(null, res.text);
          assert.equal(res.type, type);
          assert.equal(res.buffered, false);
          assert.deepEqual(res.body, {});
          let str = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            str += chunk;
          });
          res.on('end', () => {
            assert.equal(str, send);
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
        .end((error, res) => {
          assert.ifError(error);
          done();
        });
    });
  });

  describe('.agent()', () => {
    it('should return the defaut agent', (done) => {
      const agent = request.post(`${base}/echo`).agent();
      assert.equal(agent, false);
      done();
    });
  });

  describe('.agent(undefined)', () => {
    it('should set an agent to undefined and ensure it is chainable', (done) => {
      const request_ = request.get(`${base}/echo`);
      const returnValue = request_.agent(undefined);
      assert.equal(returnValue, request_);
      assert.strictEqual(request_.agent(), undefined);
      done();
    });
  });

  describe('.agent(new http.Agent())', () => {
    it('should set passed agent', (done) => {
      const http = require('http');
      const request_ = request.get(`${base}/echo`);
      const agent = new http.Agent();
      const returnValue = request_.agent(agent);
      assert.equal(returnValue, request_);
      assert.equal(request_.agent(), agent);
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
          assert.equal(res.text, null);
          assert.equal(res.body.toString(), 'hello this is dog');
          assert.equal(res.buffered, true);
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
        .end((error, res) => {
          assert.ifError(error);
          assert.equal(res.buffered, false);
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
        .end((error, res) => {
          assert.ifError(error);
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
        .end((error, res) => {
          try {
            assert.equal(res.text, 'wahoo');
            next();
          } catch (err) {
            next(err);
          }
        });
    });
});
