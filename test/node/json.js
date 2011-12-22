
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

describe('req.send(Object) as "json"', function(){
  it('should default to json', function(done){
    request
    .post('http://localhost:3001/echo')
    .send({ name: 'tobi' })
    .end(function(res){
      res.should.be.json
      res.text.should.equal('{"name":"tobi"}');
      done();
    });
  })

  it('should work with arrays', function(done){
    request
    .post('http://localhost:3001/echo')
    .send([1,2,3])
    .end(function(res){
      res.should.be.json
      res.text.should.equal('[1,2,3]');
      done();
    });
  })
  
  describe('when called several times', function(){
    it('should merge the objects', function(done){
      request
      .post('http://localhost:3001/echo')
      .send({ name: 'tobi' })
      .send({ age: 1 })
      .end(function(res){
        res.should.be.json
        res.text.should.equal('{"name":"tobi","age":1}');
        done();
      });
    })
  })
})

describe('res.body', function(){
  describe('application/json', function(){
    it('should parse the body', function(done){
      request
      .get('http://localhost:3001/json')
      .end(function(res){
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    })
  })
})
