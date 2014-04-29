
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

app.all('/ua', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.listen(3345);

describe('req.get()', function(){
  it('should set a default user-agent', function(done){
    request
    .get('http://localhost:3345/ua')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent']);
      assert(/^node-superagent\/\d+\.\d+\.\d+$/.test(res.headers['user-agent']));
      done();
    });
  });

  it('should be able to override user-agent', function(done){
    request
    .get('http://localhost:3345/ua')
    .set('User-Agent', 'foo/bar')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent'] == 'foo/bar');
      done();
    });
  });

  it('should be able to wipe user-agent', function(done){
    request
    .get('http://localhost:3345/ua')
    .unset('User-Agent')
    .end(function(err, res){
      assert(res.headers);
      assert(res.headers['user-agent'] == void 0);
      done();
    });
  });
});
