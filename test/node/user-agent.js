'use strict';
const assert = require('assert');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('req.get()', async () => {
  const setup = await getSetup();
  const base = setup.uri;

  it('should not set a default user-agent', () =>
    request.get(`${base}/ua`).then((res) => {
      assert(res.headers);
      assert(!res.headers['user-agent']);
    }));
});
