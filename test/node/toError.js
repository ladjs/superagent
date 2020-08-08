'use strict';
const assert = require('assert');
const request = require('../support/client');
const express = require('../support/express');

const app = express();
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

app.get('/', (req, res) => {
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
      var err = res.toError();
      assert.equal(err.status, 400);
      assert.equal(err.method, 'GET');
      assert.equal(err.path, '/');
      assert.equal(err.message, 'cannot GET / (400)');
      assert.equal(err.text, 'invalid json');
      done();
    });
  });
});
