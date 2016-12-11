var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var fs = require('fs');

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
