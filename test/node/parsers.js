
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express();

app.get('/manny', function(req, res){
  res.send('{"name":"manny"}');
});

app.listen(3033);

describe('req.parse(fn)', function(){
  it('should take precedence over default parsers', function(done){
    request
    .get('http://localhost:3033/manny')
    .parse(request.parse['application/json'])
    .end(function(res){
      assert(res.ok);
      assert('{"name":"manny"}' == res.text);
      assert('manny' == res.body.name);
      done();
    });
  })
})