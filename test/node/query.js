
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.get('/', function(req, res){
  res.send(req.query);
});

app.del('/', function(req, res){
  res.send(req.query);
});

app.listen(3006);

describe('req.send(Object)', function(){
  describe('on a GET request', function(){
    it('should construct the query-string', function(done){
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

    it('should append to the original query-string', function(done){
      request
      .get('http://localhost:3006/?name=tobi')
      .send({ order: 'asc' })
      .end(function(res) {
        res.body.should.eql({ name: 'tobi', order: 'asc' });
        done();
      });
    });

    it('should retain the original query-string', function(done){
      request
      .get('http://localhost:3006/?name=tobi')
      .end(function(res) {
        res.body.should.eql({ name: 'tobi' });
        done();
      });
    });
  })
})

describe('req.query(Object)', function(){
  it('should construct the query-string', function(done){
    request
    .del('http://localhost:3006/')
    .query({ name: 'tobi' })
    .query({ order: 'asc' })
    .query({ limit: ['1', '2'] })
    .end(function(res){
      res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
      done();
    });
  })

  it('should work after setting header fields', function(done){
    request
    .del('http://localhost:3006/')
    .set('Foo', 'bar')
    .set('Bar', 'baz')
    .query({ name: 'tobi' })
    .query({ order: 'asc' })
    .query({ limit: ['1', '2'] })
    .end(function(res){
      res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
      done();
    });
  })

  it('should append to the original query-string', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .query({ order: 'asc' })
    .end(function(res) {
      res.body.should.eql({ name: 'tobi', order: 'asc' });
      done();
    });
  });

  it('should retain the original query-string', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .end(function(res) {
      res.body.should.eql({ name: 'tobi' });
      done();
    });
  });
})
