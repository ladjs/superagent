
var request = require('../../')
  , express = require('express')
  , app = express.createServer();

app.get('/login', function(req, res){
  res.send('<form id="login"></form>');
});

app.listen(3000);

describe('request(method, url).end(fn)', function(){
  it('should issue a request', function(done){
    request('GET', 'http://localhost:3000/login')
    .end(function(res){
      res.status.should.equal(200);
      done();
    });
  })
})