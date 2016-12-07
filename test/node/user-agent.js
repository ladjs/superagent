
var request = require('../..'),
    express = require('express'),
    assert = require('assert'),
    app = express();

app.all('/ua', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

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
