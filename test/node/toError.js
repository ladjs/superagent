
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

app.get('/', function(req, res){
  res.send(400, 'invalid json');
});

app.listen(8888);

describe('res.toError()', function(){
  it('should return an Error', function(done){
    request
    .get('http://localhost:8888/')
    .end(function(res){
      var err = res.toError();
      assert(err.status == 400);
      assert(err.method == 'GET');
      assert(err.path == '/');
      assert(err.message == 'cannot GET / (400)');
      done();
    });
  })
})
