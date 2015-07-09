
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express();

app.all('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.get('/no-content', function(req, res){
  res.status(204);
  res.end();
});

app.get('/json-hal', function(req, res){
  res.set('content-type', 'application/hal+json');
  res.send({ name: 'hal 5000' });
});

app.get('/collection-json', function(req, res){
  res.set('content-type', 'application/vnd.collection+json');
  res.send({ name: 'chewbacca' });
});

app.listen(3005);

describe('req.send(Object) as "json"', function(){
  it('should default to json', function(done){
    request
    .post('http://localhost:3005/echo')
    .send({ name: 'tobi' })
    .end(function(err, res){
      res.should.be.json
      res.text.should.equal('{"name":"tobi"}');
      done();
    });
  })

  it('should work with arrays', function(done){
    request
    .post('http://localhost:3005/echo')
    .send([1,2,3])
    .end(function(err, res){
      res.should.be.json
      res.text.should.equal('[1,2,3]');
      done();
    });
  });

  it('should work with value null', function(done){
    request
    .post('http://localhost:3005/echo')
    .type('json')
    .send('null')
    .end(function(err, res){
      res.should.be.json
      assert(res.body === null);
      done();
    });
  });

  it('should work with type json-patch', function(done){
    request
    .patch('http://localhost:3005/echo')
    .type('application/json-patch+json')
    .send([{ "op": "remove", "path": "/foo"}])
    .end(function(err, res){
      res.headers['content-type'].should.equal('application/json-patch+json');
      res.text.should.equal('[{"op":"remove","path":"/foo"}]');
      done();
    });
  });

  it('should throw error with invalid type', function(done){
    try {
      request
      .patch('http://localhost:3005/echo')
      .type('application/json-patch')
      .send([{ "op": "remove", "path": "/foo"}])
      .end();
    } catch(e) {
      assert(e);
      assert(e.name === 'TypeError');
      done();
    }
  });

  it('should work with type jsonapi', function(done){
    request
    .patch('http://localhost:3005/echo')
    .type('application/vnd.api+json')
    .send({ name: 'tobi' })
    .end(function(err, res){
      res.headers['content-type'].should.equal('application/vnd.api+json');
      res.text.should.equal('{"name":"tobi"}');
      done();
    });
  });

  it('should work with value false', function(done){
    request
    .post('http://localhost:3005/echo')
    .type('json')
    .send('false')
    .end(function(err, res){
      res.should.be.json
      res.body.should.equal(false);
      done();
    });
  });

  it('should work with value 0', function(done){
    request
    .post('http://localhost:3005/echo')
    .type('json')
    .send('0')
    .end(function(err, res){
      res.should.be.json
      res.body.should.equal(0);
      done();
    });
  });

  it('should work with empty string value', function(done){
    request
    .post('http://localhost:3005/echo')
    .type('json')
    .send('""')
    .end(function(err, res){
      res.should.be.json
      res.body.should.equal("");
      done();
    });
  });

  it('should work with GET', function(done){
    request
    .get('http://localhost:3005/echo')
    .send({ tobi: 'ferret' })
    .end(function(err, res){
      res.should.be.json
      res.text.should.equal('{"tobi":"ferret"}');
      done();
    });
  });

  describe('when called several times', function(){
    it('should merge the objects', function(done){
      request
      .post('http://localhost:3005/echo')
      .send({ name: 'tobi' })
      .send({ age: 1 })
      .end(function(err, res){
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
      .get('http://localhost:3005/json')
      .end(function(err, res){
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    })
  })

  describe('HEAD requests', function(){
    it('should not throw a parse error', function(done){
      request
      .head('http://localhost:3005/json')
      .end(function(err, res){
        assert(err === null);
        assert(res.text === undefined)
        assert(Object.keys(res.body).length === 0)
        done();
      });
    });
  });

  describe('No content', function(){
    it('should not throw a parse error', function(done){
      request
      .get('http://localhost:3005/no-content')
      .end(function(err, res){
        assert(err === null);
        assert(res.text === '');
        assert(Object.keys(res.body).length === 0);
        done();
      });
    });
  });

  describe('application/json+hal', function(){
    it('should parse the body', function(done){
      request
      .get('http://localhost:3005/json-hal')
      .end(function(err, res){
        if (err) return done(err);
        res.text.should.equal('{"name":"hal 5000"}');
        res.body.should.eql({ name: 'hal 5000' });
        done();
      });
    })
  })

  describe('vnd.collection+json', function(){
    it('should parse the body', function(done){
      request
      .get('http://localhost:3005/collection-json')
      .end(function(err, res){
        res.text.should.equal('{"name":"chewbacca"}');
        res.body.should.eql({ name: 'chewbacca' });
        done();
      });
    })
  })
})
