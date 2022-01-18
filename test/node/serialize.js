'use strict';

const assert = require('assert');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('req.serialize(fn)', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  it('should take precedence over default parsers', (done) => {
    request
      .post(`${base}/echo`)
      .send({ foo: 123 })
      .serialize(() => '{"bar":456}')
      .end((error, response) => {
        assert.ifError(error);
        assert.equal('{"bar":456}', response.text);
        assert.equal(456, response.body.bar);
        done();
      });
  });
});
