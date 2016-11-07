
var request = require('../..'),
    express = require('express'),
    assert = require('assert'),
    app = express();

app.get('/', function(req, res){
  res.status(400).send('invalid json');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('res.toError()', function(){
  it('should return an Error', function(done){
    request
    .get(base)
    .end(function(err, res){
      var err = res.toError();
      assert.equal(err.status, 400);
      assert.equal(err.method, 'GET');
      assert.equal(err.path, '/');
      assert.equal(err.message, 'cannot GET / (400)');
      assert.equal(err.text, 'invalid json');
      done();
    });
  })
})
