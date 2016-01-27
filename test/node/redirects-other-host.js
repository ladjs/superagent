
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , app2 = express()
  , should = require('should');

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

var base2 = 'http://localhost'
var server2;
before(function listen(done) {
  server2 = app2.listen(0, function listening() {
    base2 += ':' + server2.address().port;
    done();
  });
});

app.all('/test-301', function(req, res){
  res.redirect(301, base2 + '/');
});
app.all('/test-302', function(req, res){
  res.redirect(302, base2 + '/');
});
app.all('/test-303', function(req, res){
  res.redirect(303, base2 + '/');
});
app.all('/test-307', function(req, res){
  res.redirect(307, base2 + '/');
});
app.all('/test-308', function(req, res){
  res.redirect(308, base2 + '/');
});


app2.all('/', function(req, res) {
  res.send(req.method);
});

describe('request.get', function(){
  describe('on 301 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get(base + '/test-301')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port);
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 302 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get(base + '/test-302')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 303 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get(base + '/test-303')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 307 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get(base + '/test-307')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 308 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .get(base + '/test-308')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
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
        .post(base + '/test-301')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 302 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .post(base + '/test-302')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 303 redirect', function(){
    it('should follow Location with a GET request', function(done){
      var req = request
        .post(base + '/test-303')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('GET');
          done();
        });
    })
  });
  describe('on 307 redirect', function(){
    it('should follow Location with a POST request', function(done){
      var req = request
        .post(base + '/test-307')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('POST');
          done();
        });
    })
  });
  describe('on 308 redirect', function(){
    it('should follow Location with a POST request', function(done){
      var req = request
        .post(base + '/test-308')
        .redirects(1)
        .end(function(err, res){
          req.req._headers.host.should.eql('localhost:' + server2.address().port + '');
          res.status.should.eql(200);
          res.text.should.eql('POST');
          done();
        });
    })
  });
});
