'use strict';
const request = require('../support/client');

const express = require('../support/express');

const app = express();
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

let base = 'http://localhost';
let server;
describe('request.get().set()', () => {
  after(function exitServer() {
    if (typeof server.close === 'function') {
      server.close();
    } else {
      server.destroy();
    }
  });

  it('should set host header after get()', done => {
    app.get('/', (req, res) => {
      req.hostname.should.equal('example.com');
      res.end();
    });

    server = http.createServer(app);
    server.listen(0, function listening() {
      base += `:${server.address().port}`;

      request
        .get(base)
        .set('host', 'example.com')
        .end(() => {
          done();
        });
    });
  });
});
