require('should');
require('should-http');

var request = require('../../'),
  assert = require('assert'),
  express = require('express'),
  zlib = require('zlib');

var app = express(),
  subject = 'some long long long long string';

var base = 'http://localhost';
var server;

before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});
app.get('/binary', function(req, res) {
  zlib.deflate(subject, function(err, buf) {
    res.set('Content-Encoding', 'gzip');
    res.send(buf);
  });
});
app.get('/corrupt', function(req, res) {
  res.set('Content-Encoding', 'gzip');
  res.send("blah");
});

app.get('/nocontent', function(req, res, next) {
  res.statusCode = 204;
  res.set('Content-Type', 'text/plain');
  res.set('Content-Encoding', 'gzip');
  res.send('');
});

app.get('/', function(req, res, next) {
  zlib.deflate(subject, function(err, buf) {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.send(buf);
  });
});

app.get('/junk', function(req, res) {
  zlib.deflate(subject, function(err, buf) {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.write(buf);
    res.end(" 0 junk");
  });
});

app.get('/chopped', function(req, res) {
  zlib.deflate(subject + '123456', function(err, buf) {
    res.set('Content-Type', 'text/plain');
    res.set('Content-Encoding', 'gzip');
    res.send(buf.slice(0,-1));
  });
});

describe('zlib', function() {
  it('should deflate the content', function(done) {
    request
      .get(base)
      .end(function(err, res) {
        res.should.have.status(200);
        res.text.should.equal(subject);
        res.headers['content-length'].should.be.below(subject.length);
        done();
      });
  });

  it('should ignore trailing junk', function(done) {
    request
      .get(base + '/junk')
      .end(function(err, res) {
        res.should.have.status(200);
        res.text.should.equal(subject);
        done();
      });
  });

  it('should ignore missing data', function(done) {
    request
      .get(base + '/chopped')
      .end(function(err, res) {
        assert.equal(undefined, err);
        res.should.have.status(200);
        res.text.should.startWith(subject);
        done();
      });
  });

  it('should handle corrupted responses', function(done) {
    request
      .get(base + '/corrupt')
      .end(function(err, res) {
        assert(err, 'missing error');
        assert(!res, 'response should not be defined');
        done();
      });
  });

  it('should handle no content with gzip header', function(done) {
    request
      .get(base + '/nocontent')
      .end(function(err, res) {
        assert.ifError(err);
        assert(res);
        res.should.have.status(204);
        res.text.should.equal('');
        res.headers.should.not.have.property('content-length');
        done();
      });
  });

  describe('without encoding set', function() {
    it('should emit buffers', function(done) {
      request
        .get(base + '/binary')
        .end(function(err, res) {
          res.should.have.status(200);
          res.headers['content-length'].should.be.below(subject.length);

          res.on('data', function(chunk) {
            chunk.should.have.length(subject.length);
          });

          res.on('end', done);
        });
    });
  });
});
