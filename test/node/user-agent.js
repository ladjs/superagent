'use strict';
const assert = require('assert');
const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;

describe('req.get()', () => {
  it('should not set a default user-agent', () =>
    request.get(`${base}/ua`).then((res) => {
      assert(res.headers);
      assert(!res.headers['user-agent']);
    }));
});
