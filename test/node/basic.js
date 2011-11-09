
var request = require('../../')
  , express = require('express')
  , app = express.createServer();

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.listen(3000);

describe('request(method, url)', function(){
  describe('.end()', function(){
    it('should issue a request', function(done){
      request('GET', 'http://localhost:3000/login')
      .on('response', function(res){
        // TODO: make this a superagent.Response
        res.statusCode.should.equal(200);
        done();
      })
      .end();
    })
  })

  describe('.end(fn)', function(){
    it('should issue a request', function(done){
      request('GET', 'http://localhost:3000/login')
      .end(function(res){
        res.status.should.equal(200);
        done();
      });
    })
  })
})