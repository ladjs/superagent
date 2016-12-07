var assert = require('assert');
var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;

describe('req.get()', function(){
  it('should set a default user-agent', function(){
    return request
    .get(base + '/ua')
    .then(function(res){
      assert(res.headers);
      assert(res.headers['user-agent']);
      assert(/^node-superagent\/\d+\.\d+\.\d+(?:-[a-z]+\.\d+|$)/.test(res.headers['user-agent']));
    });
  });

  it('should be able to override user-agent', function(){
    return request
    .get(base + '/ua')
    .set('User-Agent', 'foo/bar')
    .then(function(res){
      assert(res.headers);
      assert.equal(res.headers['user-agent'], 'foo/bar');
    });
  });

  it('should be able to wipe user-agent', function(){
    return request
    .get(base + '/ua')
    .unset('User-Agent')
    .then(function(res){
      assert(res.headers);
      assert.equal(res.headers['user-agent'], void 0);
    });
  });
});
