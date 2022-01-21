'use strict';
const assert = require('assert');
const dns = require('dns');
const request = require('../support/client');
const getSetup = require('../support/setup');

let base = null;

function myLookup(hostname, options, callback) {
  dns.lookup(hostname, options, callback);
}

describe('req.lookup()', () => {
  before(async () => {
    const setup = await getSetup();
    base = setup.uri;
  });
  it('should set a custom lookup', (done) => {
    const r = request.get(`${base}/ok`).lookup(myLookup);
    assert(r.lookup() === myLookup);
    r.then((res) => {
      res.text.should.equal('ok');
      done();
    });
  });
});
