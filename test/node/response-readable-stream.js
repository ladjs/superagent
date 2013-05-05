
var request = require('../../')
  , express = require('express')
  , app = express()
  , fs = require('fs');

app.get('/', function(req, res){
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
});

app.listen(3025);

describe('response', function(){
  it('should act as a readable stream', function(done){
    var req = request
      .get('http://localhost:3025')
      .buffer(false);

    req.end(function(err,res){
      if (err) return done(err);
      res.on('end', done);

      (function(){ res.pause() }).should.not.throw();
      (function(){ res.resume() }).should.not.throw();
      (function(){ res.destroy() }).should.not.throw();
    });
  });
});
