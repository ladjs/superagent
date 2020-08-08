'use strict';
if (!process.env.HTTP2_TEST) {
  return;
}

const assert = require('assert');
const url = require('url');
const request = require('../..');
const setup = require('../support/setup');

const base = setup.uri;

describe('request.get().http2()', () => {
  it('should preserve the encoding of the url', (done) => {
    request
      .get(`${base}/url?a=(b%29`)
      .http2()
      .end((err, res) => {
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
