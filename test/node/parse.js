
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/stuff', function(req, res){
  res.send('{"name":"manny"}');
})
app.listen(3025);

describe('.parse(fn)', function(){
  describe('weird/mimetype',function(){
    it('should parse the body', function(done){
      request
      .get('http://localhost:3025/stuff')
      .parse(request.parse['application/json']) // just use the default json parser
      .end(function(res){
        // should not default to json content type
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    })
  })
})