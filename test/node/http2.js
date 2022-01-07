'use strict';
if (!process.env.HTTP2_TEST) {
  return;
}

const assert = require('assert');
const url = require('url');
const request = require('../..');
const getSetup = require('../support/setup');

describe('request.get().http2()', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  it('should preserve the encoding of the url', (done) => {
    request
      .get(`${base}/url?a=(b%29`)
      .http2()
      .end((error, res) => {
        assert.equal('/url?a=(b%29', res.text);
        done();
      });
  });

  it('should format the url', () =>
    request
      .get(url.parse(`${base}/login`))
      .http2()
      .then((res) => {
        assert(res.ok);
      }));

  it('should default to http', () =>
    request
      .get('localhost:5000/login')
      .http2()
      .then((res) => {
        assert.equal(res.status, 200);
      }));
});
