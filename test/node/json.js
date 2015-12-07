
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

app.get('/invalid-json', function(req, res) {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
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

  it('should work with vendor MIME type', function(done){
    request
    .post('http://localhost:3005/echo')
    .set('Content-Type', 'application/vnd.example+json')
    .send({ name: 'vendor' })
    .end(function(err, res){
      res.text.should.equal('{"name":"vendor"}');
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

  describe('Invalid JSON response', function(){
    it('should return the raw response', function(done){
      request
      .get('http://localhost:3005/invalid-json')
      .end(function(err, res){
        assert.deepEqual(err.rawResponse, ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
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
