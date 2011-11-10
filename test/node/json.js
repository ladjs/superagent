
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.listen(3001);

// TODO: "response" event should be a Response

describe('request.VERB(path)', function(){
  describe('req.data(Object)', function(){
    it('should default to json', function(done){
      request
      .post('http://localhost:3001/echo')
      .data({ name: 'tobi' })
      .end(function(res){
        res.header['content-type'].should.equal('application/json');
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
    })
    
    describe('when called several times', function(){
      it('should merge the objects', function(done){
        request
        .post('http://localhost:3001/echo')
        .data({ name: 'tobi' })
        .data({ age: 1 })
        .end(function(res){
          res.header['content-type'].should.equal('application/json');
          res.text.should.equal('{"name":"tobi","age":1}');
          done();
        });
      })
    })
  })
})