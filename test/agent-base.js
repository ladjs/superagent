var setup = require('./support/setup');
var base = setup.uri;
var assert = require('assert');
var request = require('../');

describe('Agent', function() {
  it("should remember defaults", function() {
    if ('undefined' === typeof Promise) {
      return;
    }

    var called = 0;
    var agent = request.agent()
      .accept('json')
      .use(function() {called++})
      .query({hello:"world"})
      .set("X-test", "testing");
    assert.equal(0, called);

    return agent.get(base + '/echo')
    .then(function(res) {
      assert.equal(1, called);
      assert.equal('application/json', res.headers.accept);
      assert.equal('testing', res.headers['x-test']);

      return agent.get(base + '/querystring');
    })
    .then(function(res) {
      assert.equal(2, called);
      assert.deepEqual({hello:"world"}, res.body);
    });
  });
});
