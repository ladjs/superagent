
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.get('/', function(req, res){
  res.send(req.query);
});

app.listen(3006);

// TODO: "response" event should be a Response

describe('req.send(Object)', function(){
  describe('on a GET request', function(){
    it('should send x-www-form-urlencoded data', function(done){
      request
      .get('http://localhost:3006/')
      .send({ name: 'tobi' })
      .send({ order: 'asc' })
      .send({ limit: ['1', '2'] })
      .end(function(res){
        res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
        done();
      });
    })
  })
})