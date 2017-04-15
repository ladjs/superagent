var http = require('http')
  , assert = require('better-assert')
  , request = require('../..');

describe('request', function () {
  describe('raw server', function () {
    var server;
    var url;
    before(function (done) {
      server = http.createServer();
      server.on('request', function (req, res) {
        res.end('asdfasdf');
      });
      server.listen(0, function () {
        var port = server.address().port;
        url = 'http://127.0.0.1:' + port + '/';
        done();
      });
    });

    after(function (done) {
      server.close(function () {
        done();
      });
    });

    it('should set res.body if server response header does not contain content-type', function (done) {
      request
        .get(url)
        .buffer(true)
        .end(function (res) {
          assert('asdfasdf' == res.body);
          done();
        })
    });
  });
});
