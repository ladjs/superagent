var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.delete('/delete-me', function(req, res){
  return res.status(200).end();
});

app.listen(3005);

describe('delete with length', function(){
  it('should delete with a content-length of 0', function(done){
    request.del('http://localhost:3005/delete-me')
    .end(function(err, res) {
      res.headers['Content-Type'].should.equal('0');
      return done();
    })
  })
})
