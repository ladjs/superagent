'use strict';
const assert = require('assert');
const request = require('../support/client');
const express = require('../support/express');

const app = express();
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

app.get('/', (request_, res) => {
  res.status(400).send('invalid json');
});

let base = 'http://localhost';
let server;
before(function listen(done) {
  server = http.createServer(app);
  server = server.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe('res.toError()', () => {
  it('should return an Error', (done) => {
    request.get(base).end((err, res) => {
      const error = res.toError();
      assert.equal(error.status, 400);
      assert.equal(error.method, 'GET');
      assert.equal(error.path, '/');
      assert.equal(error.message, 'cannot GET / (400)');
      assert.equal(error.text, 'invalid json');
      done();
    });
  });
});
