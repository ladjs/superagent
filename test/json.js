var setup = require('./support/setup');
var uri = setup.uri;
var doesntWorkInBrowserYet = setup.NODE;

var assert = require('assert');
var request = require('../');

describe('req.send(Object) as "json"', function(){
  this.timeout(20000);

  it('should default to json', function(done){
    request
    .post(uri + '/echo')
    .send({ name: 'tobi' })
    .end(function(err, res){
      res.should.be.json();
      res.text.should.equal('{"name":"tobi"}');
      done();
    });
  })

  it('should work with arrays', function(done){
    request
    .post(uri + '/echo')
    .send([1,2,3])
    .end(function(err, res){
      res.should.be.json();
      res.text.should.equal('[1,2,3]');
      done();
    });
  });

  it('should work with value null', function(done){
    request
    .post(uri + '/echo')
    .type('json')
    .send('null')
    .end(function(err, res){
      res.should.be.json();
      assert.strictEqual(res.body, null);
      done();
    });
  });

  it('should work with value false', function(done){
    request
    .post(uri + '/echo')
    .type('json')
    .send('false')
    .end(function(err, res){
      res.should.be.json();
      res.body.should.equal(false);
      done();
    });
  });

  if (doesntWorkInBrowserYet) it('should work with value 0', function(done){ // fails in IE9
    request
    .post(uri + '/echo')
    .type('json')
    .send('0')
    .end(function(err, res){
      res.should.be.json();
      res.body.should.equal(0);
      done();
    });
  });

  it('should work with empty string value', function(done){
    request
    .post(uri + '/echo')
    .type('json')
    .send('""')
    .end(function(err, res){
      res.should.be.json();
      res.body.should.equal("");
      done();
    });
  });

  if (doesntWorkInBrowserYet) it('should work with GET', function(done){
    request
    .get(uri + '/echo')
    .send({ tobi: 'ferret' })
    .end(function(err, res){
      try {
        res.should.be.json();
        res.text.should.equal('{"tobi":"ferret"}');
        ({"tobi":"ferret"}).should.eql(res.body);
        done();
      } catch(e) {done(e);}
    });
  });

  it('should work with vendor MIME type', function(done){
    request
    .post(uri + '/echo')
    .set('Content-Type', 'application/vnd.example+json')
    .send({ name: 'vendor' })
    .end(function(err, res){
      res.text.should.equal('{"name":"vendor"}');
      ({"name":"vendor"}).should.eql(res.body);
      done();
    });
  });

  describe('when called several times', function(){
    it('should merge the objects', function(done){
      request
      .post(uri + '/echo')
      .send({ name: 'tobi' })
      .send({ age: 1 })
      .end(function(err, res){
        res.should.be.json();
        res.text.should.equal('{"name":"tobi","age":1}');
        ({"name":"tobi","age":1}).should.eql(res.body);
        done();
      });
    })
  })
})

describe('res.body', function(){
  this.timeout(20000);

  describe('application/json', function(){
    it('should parse the body', function(done){
      request
      .get(uri + '/json')
      .end(function(err, res){
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    })
  })

  if (doesntWorkInBrowserYet) describe('HEAD requests', function(){
    it('should not throw a parse error', function(done){
      request
      .head(uri + '/json')
      .end(function(err, res){
        try {
        assert.strictEqual(err, null);
        assert.strictEqual(res.text, undefined)
        assert.strictEqual(Object.keys(res.body).length, 0)
        done();
        } catch(e) {done(e);}
      });
    });
  });

  describe('Invalid JSON response', function(){
    it('should return the raw response', function(done){
      request
      .get(uri + '/invalid-json')
      .end(function(err, res){
        assert.deepEqual(err.rawResponse, ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
        done();
      });
    });

    it('should return the http status code', function(done){
      request
      .get(uri + '/invalid-json-forbidden')
      .end(function(err, res){
        assert.equal(err.statusCode, 403);
        done();
      });
    });
  });

  if (doesntWorkInBrowserYet) describe('No content', function(){
    it('should not throw a parse error', function(done){
      request
      .get(uri + '/no-content')
      .end(function(err, res){
        try {
        assert.strictEqual(err, null);
        assert.strictEqual(res.text, '');
        assert.strictEqual(Object.keys(res.body).length, 0);
        done();
        } catch(e) {done(e);}
      });
    });
  });

  if (doesntWorkInBrowserYet) describe('application/json+hal', function(){
    it('should parse the body', function(done){
      request
      .get(uri + '/json-hal')
      .end(function(err, res){
        if (err) return done(err);
        res.text.should.equal('{"name":"hal 5000"}');
        res.body.should.eql({ name: 'hal 5000' });
        done();
      });
    })
  })

  if (doesntWorkInBrowserYet) describe('vnd.collection+json', function(){
    it('should parse the body', function(done){
      request
      .get(uri + '/collection-json')
      .end(function(err, res){
        res.text.should.equal('{"name":"chewbacca"}');
        res.body.should.eql({ name: 'chewbacca' });
        done();
      });
    })
  })
})
