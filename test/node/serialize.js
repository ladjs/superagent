'use strict';

const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;
const assert = require('assert');

describe('req.serialize(fn)', () => {
  it('should take precedence over default parsers', (done) => {
    request
      .post(`${base}/echo`)
      .send({ foo: 123 })
      .serialize((data) => '{"bar":456}')
      .end((err, res) => {
        assert.ifError(err);
        assert.equal('{"bar":456}', res.text);
        assert.equal(456, res.body.bar);
        done();
      });
  });
});
