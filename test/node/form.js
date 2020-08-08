'use strict';

const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;
const assert = require('assert');

describe('Merging objects', () => {
  it("Don't mix Buffer and JSON", () => {
    assert.throws(() => {
      request
        .post('/echo')
        .send(Buffer.from('some buffer'))
        .send({ allowed: false });
    });
  });
});

describe('req.send(String)', () => {
  it('should default to "form"', (done) => {
    request
      .post(`${base}/echo`)
      .send('user[name]=tj')
      .send('user[email]=tj@vision-media.ca')
      .end((err, res) => {
        res.header['content-type'].should.equal(
          'application/x-www-form-urlencoded'
        );
        res.body.should.eql({
          user: { name: 'tj', email: 'tj@vision-media.ca' }
        });
        done();
      });
  });
});

describe('res.body', () => {
  describe('application/x-www-form-urlencoded', () => {
    it('should parse the body', (done) => {
      request.get(`${base}/form-data`).end((err, res) => {
        res.text.should.equal('pet[name]=manny');
        res.body.should.eql({ pet: { name: 'manny' } });
        done();
      });
    });
  });
});
