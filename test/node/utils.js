'use strict';
const assert = require('assert');
const utils = require('../../lib/utils');

describe('utils.type(str)', () => {
  it('should return the mime type', () => {
    utils
      .type('application/json; charset=utf-8')
      .should.equal('application/json');

    utils.type('application/json').should.equal('application/json');
  });
});

describe('utils.params(str)', () => {
  it('should return the field parameters', () => {
    const obj = utils.params('application/json; charset=utf-8; foo  = bar');
    obj.charset.should.equal('utf-8');
    obj.foo.should.equal('bar');

    utils.params('application/json').should.eql({});
  });
});

describe('utils.parseLinks(str)', () => {
  it('should parse links', () => {
    const str =
      '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next", <https://api.github.com/repos/visionmedia/mocha/issues?page=5>; rel="last"';
    const ret = utils.parseLinks(str);
    ret.next.should.equal(
      'https://api.github.com/repos/visionmedia/mocha/issues?page=2'
    );
    ret.last.should.equal(
      'https://api.github.com/repos/visionmedia/mocha/issues?page=5'
    );
  });
});
