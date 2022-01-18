'use strict';
const assert = require('assert');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('req.get()', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  it('should not set a default user-agent', () =>
    request.get(`${base}/ua`).then((response) => {
      assert(response.headers);
      assert(!response.headers['user-agent']);
    }));
});
