'use strict';

const assert = require('assert');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('Merging objects', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

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
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  it('should default to "form"', (done) => {
    request
      .post(`${base}/echo`)
      .send('user[name]=tj')
      .send('user[email]=tj@vision-media.ca')
      .end((error, res) => {
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
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('application/x-www-form-urlencoded', () => {
    it('should parse the body', (done) => {
      request.get(`${base}/form-data`).end((error, res) => {
        res.text.should.equal('pet[name]=manny');
        res.body.should.eql({ pet: { name: 'manny' } });
        done();
      });
    });
  });
});
