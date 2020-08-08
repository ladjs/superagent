'use strict';
const request = require('../support/client');
const express = require('../support/express');

const app = express();
const http = require('http');
const assert = require('assert');

describe('request.get().set()', () => {
  if (process.env.HTTP2_TEST) {
    return; // request object doesn't look the same
  }

  let server;

  after(function exitServer() {
    if (typeof server.close === 'function') {
      server.close();
    } else {
      server.destroy();
    }
  });

  it('should set host header after get()', (done) => {
    app.get('/', (req, res) => {
      assert.equal(req.hostname, 'example.com');
      res.end();
    });

    server = http.createServer(app);
    server.listen(0, function listening() {
      request
        .get(`http://localhost:${server.address().port}`)
        .set('host', 'example.com')
        .then(() => {
          return request
            .get(`http://example.com:${server.address().port}`)
            .connect({
              'example.com': 'localhost',
              '*': 'fail'
            });
        })
        .then(() => done(), done);
    });
  });
});
