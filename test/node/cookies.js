
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/set', function(req, res){
  res.cookie('username', 'Tobi', { httpOnly: true });
  res.cookie('theme', 'white', { maxAge: 1500 });
  res.end();
});

app.listen(3008);

describe('cookies', function(){
  describe('res.cookies', function(){
    it('should be a CookieJar', function(done){
      request
      .get('localhost:3008/set')
      .end(function(res){
        res.cookies.constructor.name.should.equal('CookieJar');
        done();
      });
    })
  })

  describe('a single Set-Cookie', function(){
    it('should save the cookie', function(done){
      request
      .get('localhost:3008/set')
      .end(function(res){
        res.cookies.cookies.should.have.length(2);
        var cookie = res.cookies.get('username');
        cookie.should.have.property('name', 'username');
        cookie.should.have.property('value', 'Tobi');
        cookie.should.have.property('expires', Infinity);
        cookie.should.have.property('path', '/');
        cookie.should.have.property('httpOnly', true);

        var cookie = res.cookies.get('theme');
        cookie.should.have.property('name', 'theme');
        cookie.should.have.property('value', 'white');
        done();
      });
    })
  })
})