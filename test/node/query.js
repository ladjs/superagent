
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express();

app.get('/', function(req, res){
  res.status(200).send(req.query);
});

app.delete('/', function(req, res){
  res.status(200).send(req.query);
});

before(function(done) {
  app.listen(3006, done);
});

describe('req.query(String)', function(){
  it('should supply uri malformed error to the callback', function(done){
    request
    .get('http://localhost:3006')
    .query('name=toby')
    .query('a=\uD800')
    .query({ b: '\uD800' })
    .end(function(err, res){
      assert(err instanceof Error);
      assert('URIError' == err.name);
      done();
    });
  })

  it('should support passing in a string', function(done){
    request
    .del('http://localhost:3006')
    .query('name=t%F6bi')
    .end(function(err, res){
      res.body.should.eql({ name: 't%F6bi' });
      done();
    });
  })

  it('should work with url query-string and string for query', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .query('age=2%20')
    .end(function(err, res){
      res.body.should.eql({ name: 'tobi', age: '2 ' });
      done();
    });
  })

  it('should support compound elements in a string', function(done){
    request
      .del('http://localhost:3006/')
      .query('name=t%F6bi&age=2')
      .end(function(err, res){
        res.body.should.eql({ name: 't%F6bi', age: '2' });
        done();
      });
  })

  it('should work when called multiple times with a string', function(done){
    request
    .del('http://localhost:3006/')
    .query('name=t%F6bi')
    .query('age=2%F6')
    .end(function(err, res){
      res.body.should.eql({ name: 't%F6bi', age: '2%F6' });
      done();
    });
  })

  it('should work with normal `query` object and query string', function(done){
    request
    .del('http://localhost:3006/')
    .query('name=t%F6bi')
    .query({ age: '2' })
    .end(function(err, res){
      res.body.should.eql({ name: 't%F6bi', age: '2' });
      done();
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
    .end(function(err, res){
      res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
      done();
    });
  })

  it('should not error on dates', function(done){
    var date = new Date(0);

    request
    .del('http://localhost:3006/')
    .query({ at: date })
    .end(function(err, res){
      assert(date.toISOString() == res.body.at);
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
    .end(function(err, res){
      res.body.should.eql({ name: 'tobi', order: 'asc', limit: ['1', '2'] });
      done();
    });
  })

  it('should append to the original query-string', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .query({ order: 'asc' })
    .end(function(err, res) {
      res.body.should.eql({ name: 'tobi', order: 'asc' });
      done();
    });
  });

  it('should retain the original query-string', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .end(function(err, res) {
      res.body.should.eql({ name: 'tobi' });
      done();
    });
  });
})
