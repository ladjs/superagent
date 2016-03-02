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

  afterEach(function removeTmpfile(done) {
    fs.unlink(destPath, done);
  });

  it('should follow Location', function (done) {
    var stream = fs.createWriteStream(destPath);
    var redirects = [];
    request
      .get(base)
      .on('redirect', function (res) {
        redirects.push(res.headers.location);
      })
      .on('end', function () {
        var arr = [];
        arr.push('/movies');
        arr.push('/movies/all');
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        // TODO this assertion is flaky on Travis CI.
        // Sometimes we get '' out of the file instead of the expected content
        // A re-run of the build usually resolves it.
        // Would love a PR to make this pass consistently.
        // Trying a lame delay to see if it's filesystem sync latency
        setTimeout(function () {
          fs.readFileSync(destPath, 'utf8').should.eql('first movie page');
          done();
        }, 200);
      })
      .pipe(stream);
  });
});
