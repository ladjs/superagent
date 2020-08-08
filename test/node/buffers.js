'use strict';
const assert = require('assert');
const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;

describe("req.buffer['someMimeType']", () => {
  it('should respect that agent.buffer(true) takes precedent', (done) => {
    const agent = request.agent();
    agent.buffer(true);
    const type = 'application/somerandomtype';
    const send = 'somerandomtext';
    request.buffer[type] = false;
    agent
      .post(`${base}/echo`)
      .type(type)
      .send(send)
      .end((err, res) => {
        delete request.buffer[type];
        assert.ifError(err);
        assert.equal(res.type, type);
        assert.equal(send, res.text);
        assert(res.buffered);
        done();
      });
  });

  it('should respect that agent.buffer(false) takes precedent', (done) => {
    const agent = request.agent();
    agent.buffer(false);
    const type = 'application/barrr';
    const send = 'some random text2';
    request.buffer[type] = true;
    agent
      .post(`${base}/echo`)
      .type(type)
      .send(send)
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

  it('should disable buffering for that mimetype when false', (done) => {
    const type = 'application/bar';
    const send = 'some random text';
    request.buffer[type] = false;
    request
      .post(`${base}/echo`)
      .type(type)
      .send(send)
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
  it('should enable buffering for that mimetype when true', (done) => {
    const type = 'application/baz';
    const send = 'woooo';
    request.buffer[type] = true;
    request
      .post(`${base}/echo`)
      .type(type)
      .send(send)
      .end((err, res) => {
        delete request.buffer[type];
        assert.ifError(err);
        assert.equal(res.type, type);
        assert.equal(send, res.text);
        assert(res.buffered);
        done();
      });
  });
  it('should fallback to default handling for that mimetype when undefined', () => {
    const type = 'application/bazzz';
    const send = 'woooooo';
    return request
      .post(`${base}/echo`)
      .type(type)
      .send(send)
      .then((res) => {
        assert.equal(res.type, type);
        assert.equal(send, res.body.toString());
        assert(res.buffered);
      });
  });
});
