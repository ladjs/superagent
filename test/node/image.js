'use strict';

const fs = require('fs');
const request = require('../support/client');
const getSetup = require('../support/setup');

const img = fs.readFileSync(`${__dirname}/fixtures/test.png`);

describe('res.body', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('image/png', () => {
    it('should parse the body', (done) => {
      request.get(`${base}/image`).end((error, res) => {
        res.type.should.equal('image/png');
        Buffer.isBuffer(res.body).should.be.true();
        (res.body.length - img.length).should.equal(0);
        done();
      });
    });
  });
  describe('application/octet-stream', () => {
    it('should parse the body', (done) => {
      request
        .get(`${base}/image-as-octets`)
        .buffer(true) // that's tech debt :(
        .end((error, res) => {
          res.type.should.equal('application/octet-stream');
          Buffer.isBuffer(res.body).should.be.true();
          (res.body.length - img.length).should.equal(0);
          done();
        });
    });
  });
  describe('application/octet-stream', () => {
    it('should parse the body (using responseType)', (done) => {
      request
        .get(`${base}/image-as-octets`)
        .responseType('blob')
        .end((error, res) => {
          res.type.should.equal('application/octet-stream');
          Buffer.isBuffer(res.body).should.be.true();
          (res.body.length - img.length).should.equal(0);
          done();
        });
    });
  });
});
