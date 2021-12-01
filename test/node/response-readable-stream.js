'use strict';
const request = require('../support/client');
const express = require('../support/express');

const app = express();
const fs = require('fs');
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

app.get('/', (request_, res) => {
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
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

describe('response', () => {
  it('should act as a readable stream', (done) => {
    const request_ = request.get(base).buffer(false);

    request_.end((error, res) => {
      if (error) return done(error);
      let trackEndEvent = 0;
      let trackCloseEvent = 0;

      res.on('end', () => {
        trackEndEvent++;
        trackEndEvent.should.equal(1);
        if (!process.env.HTTP2_TEST) {
          trackCloseEvent.should.equal(0); // close should not have been called
        }

        done();
      });

      res.on('close', () => {
        trackCloseEvent++;
      });

      (() => {
        res.pause();
      }).should.not.throw();
      (() => {
        res.resume();
      }).should.not.throw();
      (() => {
        res.destroy();
      }).should.not.throw();
    });
  });
});
