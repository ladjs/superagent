
var EventEmitter = require('events').EventEmitter
  , request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url')
  , https = require('https')
  , fs = require('fs')
  , key = fs.readFileSync(__dirname + '/fixtures/key.pem')
  , cert = fs.readFileSync(__dirname + '/fixtures/cert.pem')
  , server;

app.get('/', function(req, res){
  res.send('Safe and secure!');
});

server = https.createServer({
  key: key,
  cert: cert
}, app);

// WARNING: this .listen() boilerplate is slightly different from most tests
// due to HTTPS. Do not copy/paste without examination.
var base = 'https://localhost'
before(function listen(done) {
  server.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('https', function(){

  describe('request', function(){
    it('should give a good response', function(done){
      request
      .get(base)
      .ca(cert)
      .end(function(err, res){
        assert(res.ok);
        assert('Safe and secure!' === res.text);
        done();
      });
    });
  });

  describe('.agent', function () {
    it('should be able to make multiple requests without redefining the certificate', function(done){
      var agent = request.agent({ca: cert});
      agent
      .get(base)
      .end(function(err, res){
        assert(res.ok);
        assert('Safe and secure!' === res.text);
        agent
        .get(url.parse(base))
        .end(function(err, res){
          assert(res.ok);
          assert('Safe and secure!' === res.text);
          done();
        });
      });
    });
  });

})
