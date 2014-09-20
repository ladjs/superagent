
var assert = require('better-assert');
var express = require('express');
var request = require('../..');
var app = express();

app.all('/huge', function(req, res){
  res.writeHead(200, req.headers);
  var mb = new Buffer(1 << 10);
  var i = 10;

  while (--i) {
    res.write(mb);
  }

  res.end();
});

app.listen(3090);

describe('req.limit(bytes)', function(){
  describe('when buffered', function(){
    it('should error if the response is larger than limit', function(done){
      request
      .get('http://localhost:3090/huge')
      .set('Content-Length', 1 << 10)
      .buffer()
      .limit(512)
      .end(function(err, res){
        if (!err) return done(new Error('expected an error'));
        assert('limit of "512" reached' == err.message);
        assert(512 == err.limit);
        assert(1 << 10 == err.length);
        done();
      });
    });
  });
});
