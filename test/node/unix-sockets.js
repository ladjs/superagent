var request = require('../../'),
    express = require('express'),
    assert = require('assert'),
    app = express(),
    http = require('http'),
    https = require('https'),
    os = require('os'),
    fs = require('fs'),
    key = fs.readFileSync(__dirname + '/fixtures/key.pem'),
    cert = fs.readFileSync(__dirname + '/fixtures/cert.pem'),
    httpSockPath = [os.tmpdir(), 'superagent-http.sock'].join('/'),
    httpsSockPath = [os.tmpdir(), 'superagent-https.sock'].join('/'),
    httpServer,
    httpsServer;

if (process.platform === 'win32') {
  return;
}

app.get('/', function(req, res) {
  res.send('root ok!');
});

app.get('/request/path', function(req, res) {
  res.send('request path ok!');
});

describe('[unix-sockets] http', function() {

  before(function(done) {
    if (fs.existsSync(httpSockPath) === true) {
      // try unlink if sock file exists
      fs.unlinkSync(httpSockPath);
    }
    httpServer = http.createServer(app);
    httpServer.listen(httpSockPath, done);
  });

  var base = 'http+unix://' + httpSockPath.replace(/\//g, '%2F');

  describe('request', function() {
    it('path: / (root)', function(done) {
      request
        .get(base + '/')
        .end(function(err, res) {
          assert(res.ok);
          assert.strictEqual('root ok!', res.text);
          done();
        });
    });

    it('path: /request/path', function(done) {
      request
        .get(base + '/request/path')
        .end(function(err, res) {
          assert(res.ok);
          assert.strictEqual('request path ok!', res.text);
          done();
        });
    });
  });

  after(function(done) {
    httpServer.close(done);
  });

});

describe('[unix-sockets] https', function() {

  before(function(done) {
    if (fs.existsSync(httpsSockPath) === true) {
      // try unlink if sock file exists
      fs.unlinkSync(httpsSockPath);
    }
    httpsServer = https.createServer({ key: key, cert: cert }, app);
    httpsServer.listen(httpsSockPath, done);
  });

  var base = 'https+unix://' + httpsSockPath.replace(/\//g, '%2F');

  describe('request', function() {
    it('path: / (root)', function(done) {
      request
        .get(base + '/')
        .ca(cert)
        .end(function(err, res) {
          assert(res.ok);
          assert.strictEqual('root ok!', res.text);
          done();
        });
    });

    it('path: /request/path', function(done) {
      request
        .get(base + '/request/path')
        .ca(cert)
        .end(function(err, res) {
          assert(res.ok);
          assert.strictEqual('request path ok!', res.text);
          done();
        });
    });
  });

  after(function(done) {
    httpsServer.close(done);
  });

});
