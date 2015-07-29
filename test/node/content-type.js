var request = require('../../')
  , express = require('express')
  , assert = require('better-assert')
  , app = express();

app.all('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

describe('req.set("Content-Type", contentType)', function(){

  it('should work with just the contentType component', function(done){
    request
    .post('http://localhost:3005/echo')
    .set('Content-Type', 'application/json')
    .send({ name: 'tobi' })
    .end(function(err, res){
      assert(!err);
      done();
    });
  });

  it('should work with the charset component', function(done){
    request
    .post('http://localhost:3005/echo')
    .set('Content-Type', 'application/json; charset=utf-8')
    .send({ name: 'tobi' })
    .end(function(err, res){
      assert(!err);
      done();
    });
  });

  it('should delete with a content-length of 0', function(done){
    request.del('http://localhost:3005/nonexistant')
    .end(function(err, res) {
      assert(err)
      res.request.req._headers['content-length'].should.equal(0)
      return done();
    })
  })
});
