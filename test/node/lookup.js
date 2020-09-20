'use strict';
const assert = require('assert');
const dns = require('dns');
const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;

function myLookup(hostname, options, callback) {
  dns.lookup(hostname, options, callback);
}

describe('req.lookup()', () => {
  it('should set a custom lookup', () => {
    const r = request.get(`${base}/ok`).lookup(myLookup);
    assert(r.lookup() === myLookup);
    r.then((res) => {
      res.text.should.equal('ok');
    });
  });
});
