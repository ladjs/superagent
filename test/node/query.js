
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.get('/', function(req, res){
  res.send(req.query);
});

app.del('/', function(req, res) {
    res.send(req.query);
});

app.listen(3006);

// TODO: "response" event should be a Response

describe('req.send(Object)', function(){
  ['get', 'del'].forEach(function(method) {
      describe('on a ' + method + ' request', function(){
        it('should construct the query-string', function(done){
          request
          [method]('http://localhost:3006/')
          .send({ name: 'tobi' })
          .send({ order: 'asc' })
          .send({ limit: ['1', '2'] })
          .end(function(res){
            res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
            done();
          });
        })

        it('should append to the original query-string', function(done){
          request
          [method]('http://localhost:3006/?name=tobi')
          .send({ order: 'asc' })
          .end(function(res) {
            res.body.should.eql({ name: 'tobi', order: 'asc' });
            done();
          });
        });

        it('should retain the original query-string', function(done){
          request
          [method]('http://localhost:3006/?name=tobi')
          .end(function(res) {
            res.body.should.eql({ name: 'tobi' });
            done();
          });
        });
      })      
  });
})
