
var request = require('../../')
  , express = require('express')
  , fs = require('fs')
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
    describe('with pipe', function() {
      beforeEach(function(done) {
        fs.unlink(__dirname + '/fixtures/temp.txt', function() {done()})
      })
      it('should deflate during pipe', function(done) {
          var writeStream = fs.createWriteStream(__dirname + '/fixtures/temp.txt')
          var req = request
            .get('http://localhost:3080/binary')

          req.on('end', function() {
            fs.readFileSync(__dirname + '/fixtures/temp.txt', 'utf8').should.be.equal(subject)
            done()
          })
          req.pipe(writeStream)
      })
    })

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
