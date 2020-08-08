'use strict';
const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;

describe('request', () => {
  describe('not modified', () => {
    let ts;
    it('should start with 200', (done) => {
      request.get(`${base}/if-mod`).end((err, res) => {
        res.should.have.status(200);
        res.text.should.match(/^\d+$/);
        ts = Number(res.text);
        done();
      });
    });

    it('should then be 304', (done) => {
      request
        .get(`${base}/if-mod`)
        .set('If-Modified-Since', new Date(ts).toUTCString())
        .end((err, res) => {
          res.should.have.status(304);
          // res.text.should.be.empty
          done();
        });
    });
  });
});
