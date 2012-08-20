
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/', function(req, res){
  if (req.header('if-modified-since')) {
    res.send(304);
  } else {
    res.send('' + Date.now())
  }
});

app.listen(3008);

describe('request', function(){
  describe('not modified', function(){
    var ts;
    it('should start with 200', function(done){
      request
      .get('http://localhost:3008/')
      .end(function(res){
        res.should.have.status(200)
        res.text.should.match(/^\d+$/);
        ts = +res.text;
        done();
      });
    })

    it('should then be 304', function(done){
      request
      .get('http://localhost:3008/')
      .set('If-Modified-Since', new Date(ts).toUTCString())
      .end(function(res){
        res.should.have.status(304)
        // res.text.should.be.empty
        done();
      });
    })
  })
})