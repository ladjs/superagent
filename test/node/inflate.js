'use strict';
require('should');
require('should-http');

const assert = require('assert');
const zlib = require('zlib');
let http = require('http');
const getPort = require('get-port');
const express = require('../support/express');
const request = require('../support/client');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

const app = express();
const subject = 'some long long long long string';

let base = 'http://localhost';
let server;

before(function listen(done) {
  server = http.createServer(app);

  getPort().then((port) => {
    server = server.listen(port, function listening() {
      base += `:${server.address().port}`;
      done();
    });
  });
});

app.get('/binary', (request_, res) => {
  zlib.deflate(subject, (error, buf) => {
    res.set('Content-Encoding', 'gzip');
    res.send(buf);
  });
});
app.get('/corrupt', (request_, res) => {
  res.set('Content-Encoding', 'gzip');
  res.send('blah');
});

app.get('/nocontent', (request_, res, next) => {
  res.statusCode = 204;
  res.set('Content-Type', 'text/plain');
  res.set('Content-Encoding', 'gzip');
  res.send('');
});

app.get('/', (request_, res, next) => {
  zlib.deflate(subject, (error, buf) => {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.send(buf);
  });
});

app.get('/junk', (request_, res) => {
  zlib.deflate(subject, (error, buf) => {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.write(buf);
    res.end(' 0 junk');
  });
});

app.get('/chopped', (request_, res) => {
  zlib.deflate(`${subject}123456`, (error, buf) => {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.send(buf.slice(0, -1));
  });
});

describe('zlib', () => {
  it('should deflate the content', (done) => {
    request.get(base).end((error, res) => {
      res.should.have.status(200);
      res.text.should.equal(subject);
      res.headers['content-length'].should.be.below(subject.length);
      done();
    });
  });

  it('should protect from zip bombs', (done) => {
    request
      .get(base)
      .buffer(true)
      .maxResponseSize(1)
      .end((error, res) => {
        try {
          assert.equal('Maximum response size reached', error && error.message);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should ignore trailing junk', (done) => {
    request.get(`${base}/junk`).end((error, res) => {
      res.should.have.status(200);
      res.text.should.equal(subject);
      done();
    });
  });

  it('should ignore missing data', (done) => {
    request.get(`${base}/chopped`).end((error, res) => {
      assert.equal(undefined, error);
      res.should.have.status(200);
      res.text.should.startWith(subject);
      done();
    });
  });

  it('should handle corrupted responses', (done) => {
    request.get(`${base}/corrupt`).end((error, res) => {
      assert(error, 'missing error');
      assert(!res, 'response should not be defined');
      done();
    });
  });

  it('should handle no content with gzip header', (done) => {
    request.get(`${base}/nocontent`).end((error, res) => {
      assert.ifError(error);
      assert(res);
      res.should.have.status(204);
      res.text.should.equal('');
      res.headers.should.not.have.property('content-length');
      done();
    });
  });

  describe('without encoding set', () => {
    it('should buffer if asked', () => {
      return request
        .get(`${base}/binary`)
        .buffer(true)
        .then((res) => {
          res.should.have.status(200);
          assert(res.headers['content-length']);
          assert(res.body.byteLength);
          assert.equal(subject, res.body.toString());
        });
    });

    it('should emit buffers', (done) => {
      request.get(`${base}/binary`).end((error, res) => {
        res.should.have.status(200);
        res.headers['content-length'].should.be.below(subject.length);

        res.on('data', (chunk) => {
          chunk.should.have.length(subject.length);
        });

        res.on('end', done);
      });
    });
  });
});
