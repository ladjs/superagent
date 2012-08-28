
var request = require('../..')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/:ms', function(req, res){
  var ms = parseInt(req.params.ms, 10);
  setTimeout(function(){
    res.send('hello');
  }, ms);
});

app.listen(3009);

describe('.timeout(ms)', function(){
  describe('when timeout is exceeded', function(done){
    it('should error', function(done){
      request
      .get('http://localhost:3009/500')
      .timeout(150)
      .end(function(err, res){
        assert(err, 'expected an error');
        assert('number' == typeof err.timeout, 'expected an error with .timeout');
        done();
      });
    })
  })
})