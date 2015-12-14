
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , app2 = express()
  , should = require('should');

app.all('/test-301', function(req, res){
  res.redirect(301, 'http://localhost:3211/');
});
app.all('/test-302', function(req, res){
  res.redirect(302, 'http://localhost:3211/');
});
app.all('/test-303', function(req, res){
  res.redirect(303, 'http://localhost:3211/');
});
app.all('/test-307', function(req, res){
  res.redirect(307, 'http://localhost:3211/');
});
app.all('/test-308', function(req, res){
  res.redirect(308, 'http://localhost:3211/');
});

app.listen(3210);


app2.all('/', function(req, res) {
  res.send(req.method);
});

app2.listen(3211);

describe('request.get', function(){
  describe('on 301 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get('http://localhost:3210/test-301')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 302 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get('http://localhost:3210/test-302')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 303 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get('http://localhost:3210/test-303')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 307 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get('http://localhost:3210/test-307')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 308 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get('http://localhost:3210/test-308')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
});

describe('request.post', function(){
  describe('on 301 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .post('http://localhost:3210/test-301')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 302 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .post('http://localhost:3210/test-302')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 303 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .post('http://localhost:3210/test-303')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 307 redirect', function(){
    it('should follow Location with a POST request', function(done){
      var req = request
        .post('http://localhost:3210/test-307')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('POST');
          done();
        });
    })
  });
  describe('on 308 redirect', function(){
    it('should follow Location with a POST request', function(done){
      var req = request
        .post('http://localhost:3210/test-308')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:3211');
          res.status.should.eql(200);
          res.text.should.eql('POST');
          done();
        });
    })
  });
});