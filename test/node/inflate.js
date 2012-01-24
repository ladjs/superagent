
var request = require('../../')
  , express = require('express')
  , zlib

/**
 * Only require zlib for Node 0.6+.
 */

try {
  zlib = require('zlib');
} catch (e) { }

if (zlib) {
  var app = express.createServer()
    , subject = 'some long long long long string';

  app.listen(3080);

  app.get('/', function (req, res, next){
    zlib.deflate(subject, function (err, buf){
      res.header('content-encoding', 'gzip');
      res.send(buf);
    });
  });

  describe('zlib', function(){
    it('should deflate the content', function(done){
      request
        .get('http://localhost:3080')
        .end(function(res){
          res.should.have.status(200);
          res.text.should.equal(subject);
          res.headers['content-length'].should.be.below(subject.length);
          done();
        });
    });
  });
}
