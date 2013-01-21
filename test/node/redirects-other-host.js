
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , should = require('should');

app.get('/test', function(req, res){
  res.redirect('https://github.com/');
});

app.listen(3210);

describe('request', function(){
  describe('on redirect', function(){
    it('should follow Location even when the host changes', function(done){
      var req = request
        .get('http://localhost:3210/test')
        .redirects(1)
        .end(function(res){
          req.req._headers.host.should.eql('github.com');
          res.status.should.eql(200);
          done();
        });
    })
  });
});