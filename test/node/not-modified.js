'use strict';
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('request', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('not modified', () => {
    let ts;
    it('should start with 200', (done) => {
      request.get(`${base}/if-mod`).end((error, res) => {
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
        .end((error, res) => {
          res.should.have.status(304);
          // res.text.should.be.empty
          done();
        });
    });
  });
});
