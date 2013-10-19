
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , Stream = require('stream');

app.all('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/json', function(req, res){
  res.send({ name: 'manny' });
});

app.listen(3005);

describe('req.send(Object) as "json"', function(){
  it('should default to json', function(done){
    request
    .post('http://localhost:3005/echo')
    .send({ name: 'tobi' })
    .end(function(res){
      res.should.be.json
      res.text.should.equal('{"name":"tobi"}');
      done();
    });
  })

  it('should catch error when serializing (callback style)',function(done){
    function CircularReference(){
      this.circular = this;
    }

    request
    .post('http://localhost:3005/echo')
    .send(new CircularReference())
    .end(function(err,res){
      err.should.be.an.instanceOf(Error);
      done();
    });
  });

  it('should catch error when serializing (pipe style)',function(done){
    function CircularReference(){
      this.circular = this;
    }
    var s = new Stream();
    s.writable = true;
    s.write = function(data){
      // don't care
    };
    request
    .post('http://localhost:3005/echo')
    .send(new CircularReference())
    .on('error',function(err){
      err.should.be.an.instanceOf(Error);
      done();
    })
    .pipe(s);
  });

  it('should work with arrays', function(done){
    request
    .post('http://localhost:3005/echo')
    .send([1,2,3])
    .end(function(res){
      res.should.be.json
      res.text.should.equal('[1,2,3]');
      done();
    });
  })

  it('should work with GET', function(done){
    request
    .get('http://localhost:3005/echo')
    .send({ tobi: 'ferret' })
    .end(function(res){
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
      .get('http://localhost:3005/json')
      .end(function(res){
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    })
  })
})
