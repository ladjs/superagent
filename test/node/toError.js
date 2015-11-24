
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

app.get('/', function(req, res){
  res.status(400).send('invalid json');
});

app.listen(65197);

describe('res.toError()', function(){
  it('should return an Error', function(done){
    request
    .get('http://localhost:65197/')
    .end(function(err, res){
      var err = res.toError();
      assert(err.status == 400);
      assert(err.method == 'GET');
      assert(err.path == '/');
      assert(err.message == 'cannot GET / (400)');
      assert(err.text == 'invalid json');
      done();
    });
  })
})
