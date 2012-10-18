
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
  var app = express()
    , subject = 'some long long long long string';

  app.listen(3080);

  app.get('/binary', function(req, res){
    zlib.deflate(subject, function (err, buf){
      res.set('Content-Encoding', 'gzip');
      res.send(buf);
    });
  });

  app.get('/', function (req, res, next){
    zlib.deflate(subject, function (err, buf){
      res.set('Content-Type', 'text/plain');
      res.set('Content-Encoding', 'gzip');
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

    describe('without encoding set', function(){
      it('should emit buffers', function(done){
        request
          .get('http://localhost:3080/binary')
          .end(function(res){
            res.should.have.status(200);
            res.headers['content-length'].should.be.below(subject.length);

            res.on('data', function(chunk){
              chunk.should.have.length(subject.length);
            });

            res.on('end', done);
          });
      })
    })
  });
}
