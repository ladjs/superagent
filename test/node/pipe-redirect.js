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

app.listen(3012);

describe('pipe on redirect', function () {
  afterEach(removeTmpfile);
  it('should follow Location', function (done) {
    var stream = fs.createWriteStream('test/node/fixtures/pipe.txt');
    var redirects = [];
    var req = request
      .get('http://localhost:3012/')
      .on('redirect', function (res) {
        redirects.push(res.headers.location);
      })
      .on('end', function () {
        var arr = [];
        arr.push('/movies');
        arr.push('/movies/all');
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        fs.readFileSync('test/node/fixtures/pipe.txt', 'utf8').should.eql('first movie page');
        done();
      });
      req.pipe(stream);
  });
});

function removeTmpfile(done) {
  fs.unlink('test/node/fixtures/pipe.txt', function (err) {
    done();
  });
}
