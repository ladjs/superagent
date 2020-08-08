'use strict';

const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;
const fs = require('fs');

const img = fs.readFileSync(`${__dirname}/fixtures/test.png`);

describe('res.body', () => {
  describe('image/png', () => {
    it('should parse the body', (done) => {
      request.get(`${base}/image`).end((err, res) => {
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
        .end((err, res) => {
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
        .end((err, res) => {
          res.type.should.equal('application/octet-stream');
          Buffer.isBuffer(res.body).should.be.true();
          (res.body.length - img.length).should.equal(0);
          done();
        });
    });
  });
});
