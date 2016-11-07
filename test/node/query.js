
var request = require('../..'),
    express = require('express'),
    assert = require('assert'),
    fs = require('fs'),
    app = express();

app.get('/', function(req, res){
  res.status(200).send(req.query);
});

app.delete('/url', function(req, res){
  res.status(200).send(req.url)
})

app.delete('/', function(req, res){
  res.status(200).send(req.query);
});

app.put('/', function(req, res){
  res.status(200).send(req.query);
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('req.query(String)', function(){
  // This is no longer true as of qs v3.0.0 (https://github.com/ljharb/qs/commit/0c6f2a6318c94f6226d3cf7fe36094e9685042b6)
  // it('should supply uri malformed error to the callback')

  it('should support passing in a string', function(done){
    request
    .del(base)
    .query('name=t%F6bi')
    .end(function(err, res){
      res.body.should.eql({ name: 't%F6bi' });
      done();
    });
  })

  it('should work with url query-string and string for query', function(done){
    request
    .del(base + '/?name=tobi')
    .query('age=2%20')
    .end(function(err, res){
      res.body.should.eql({ name: 'tobi', age: '2 ' });
      done();
    });
  })

  it('should support compound elements in a string', function(done){
    request
      .del(base)
      .query('name=t%F6bi&age=2')
      .end(function(err, res){
        res.body.should.eql({ name: 't%F6bi', age: '2' });
        done();
      });
  })

  it('should work when called multiple times with a string', function(done){
    request
    .del(base)
    .query('name=t%F6bi')
    .query('age=2%F6')
    .end(function(err, res){
      res.body.should.eql({ name: 't%F6bi', age: '2%F6' });
      done();
    });
  })

  it('should work with normal `query` object and query string', function(done){
    request
    .del(base)
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
    .del(base)
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
    .del(base)
    .query({ at: date })
    .end(function(err, res){
      assert.equal(date.toISOString(), res.body.at);
      done();
    });
  })

  it('should work after setting header fields', function(done){
    request
    .del(base)
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
    .del(base + '/?name=tobi')
    .query({ order: 'asc' })
    .end(function(err, res) {
      res.body.should.eql({ name: 'tobi', order: 'asc' });
      done();
    });
  });

  it('should retain the original query-string', function(done){
    request
    .del(base + '/?name=tobi')
    .end(function(err, res) {
      res.body.should.eql({ name: 'tobi' });
      done();
    });
  });

  it('should keep only keys with null querystring values', function(done){
    request
    .del(base + '/url')
    .query({ nil: null })
    .end(function(err, res) {
      res.text.should.equal('/url?nil');
      done();
    });
  });

  it('query-string should be sent on pipe', function(done){
    var req = request.put(base + '/?name=tobi');
    var stream = fs.createReadStream('test/node/fixtures/user.json');

    req.on('response', function(res){
      res.body.should.eql({ name: 'tobi' });
      done();
    });

    stream.pipe(req);
  });
})
