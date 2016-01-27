
var request = require('../../')
  , express = require('express')
  , app = express()
  , fs = require('fs');

app.get('/', function(req, res){
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('response', function(){
    it('should act as a readable stream', function(done){
      var req = request
        .get(base)
        .buffer(false);

      req.end(function(err,res){
        if (err) return done(err);
        var trackEndEvent = 0;
        var trackCloseEvent = 0;

        res.on('end',function(){
          trackEndEvent++;
          trackEndEvent.should.equal(1);
          trackCloseEvent.should.equal(0);  // close should not have been called
          done();
        });

        res.on('close',function(){
          trackCloseEvent++;
        });


        (function(){ res.pause() }).should.not.throw();
        (function(){ res.resume() }).should.not.throw();
        (function(){ res.destroy() }).should.not.throw();
      });
    });
});
