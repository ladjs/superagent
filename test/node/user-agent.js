
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

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
  it('should set a default user-agent', function(done){
    request
    .get(base + '/ua')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent']);
      assert(/^node-superagent\/\d+\.\d+\.\d+(?:-[a-z]+\.\d+|$)/.test(res.headers['user-agent']));
      done();
    });
  });

  it('should be able to override user-agent', function(done){
    request
    .get(base + '/ua')
    .set('User-Agent', 'foo/bar')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent'] == 'foo/bar');
      done();
    });
  });

  it('should be able to wipe user-agent', function(done){
    request
    .get(base + '/ua')
    .unset('User-Agent')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent'] == void 0);
      done();
    });
  });
});
