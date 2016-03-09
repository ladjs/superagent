var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , fs = require('fs')
  , should = require('should');

app.get('/', function (req, res) {
  res.redirect('/movies');
});

app.get('/movies', function (req, res) {
  res.redirect('/movies/all');
});

app.get('/movies/all', function (req, res) {
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function (req, res) {
  res.send('first movie page');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('pipe on redirect', function () {
  var destPath = 'test/node/fixtures/pipe.txt';

  after(function removeTmpfile(done) {
    fs.unlink(destPath, done);
  });

  it('should follow Location', function (done) {
    var stream = fs.createWriteStream(destPath);
    var redirects = [];
    var req = request
      .get(base)
      .on('redirect', function (res) {
        redirects.push(res.headers.location);
      })
    stream.on('finish', function () {
      redirects.should.eql(['/movies', '/movies/all', '/movies/all/0']);
      fs.readFileSync(destPath, 'utf8').should.eql('first movie page');
      done();
    });
    req.pipe(stream);
  });
});
