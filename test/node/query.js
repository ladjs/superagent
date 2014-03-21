
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express();

app.get('/', function(req, res){
  res.send(req.query);
});

app.del('/', function(req, res){
  res.send(req.query);
});

app.listen(3006);

describe('req.query(String)', function(){
  it('should work when called once', function(done){
    request
    .del('http://localhost:3006/')
    .query('name=tobi')
    .end(function(res){
      res.body.should.eql({ name: 'tobi' });
      done();
    });
  })

  it('should work with url query-string', function(done){
    request
    .del('http://localhost:3006/?name=tobi')
    .query('age=2')
    .end(function(res){
      res.body.should.eql({ name: 'tobi', age: '2' });
      done();
    });
  })

  it('should work with compound elements', function(done){
    request
      .del('http://localhost:3006/')
      .query('name=tobi&age=2')
      .end(function(res){
        res.body.should.eql({ name: 'tobi', age: '2' });
        done();
      });
  })

  it('should work when called multiple times', function(done){
    request
    .del('http://localhost:3006/')
    .query('name=tobi')
    .query('age=2')
    .end(function(res){
      res.body.should.eql({ name: 'tobi', age: '2' });
      done();
    });
  })

  it('should work when mixed with objects', function(done){
    request
    .del('http://localhost:3006/')
    .query('name=tobi')
    .query({ age: 2 })
    .end(function(res){
      res.body.should.eql({ name: 'tobi', age: '2' });
      done();
    });
  })

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

  // it('should leave strange formatting as-is', function(done){
  //   request
  //   .del('http://localhost:3006/')
  //   .query('a=1&a=2&a=3')
  //   .end(function(res){
  //     res.body.should.eql({ a: '3' });
  //     done();
  //   });
  // })
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

  it('should not error on dates', function(done){
    var date = new Date(0);

    request
    .del('http://localhost:3006/')
    .query({ at: date })
    .end(function(res){
      assert(String(date) == res.body.at);
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
