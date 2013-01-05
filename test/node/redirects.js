
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , should = require('should');

app.get('/', function(req, res){
  res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.send('first movie page');
});

app.post('/movie', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/tobi', function(req, res){
  res.send('tobi');
});

app.get('/relative', function(req, res){
  res.set('Location', '/tobi');
  res.send(302);
});

app.get('/header', function(req, res){
  res.redirect('/header/2');
});

app.post('/header', function(req, res){
  res.redirect('/header/2');
});

app.get('/header/2', function(req, res){
  res.send(req.headers);
});

app.listen(3003);

describe('request', function(){
  describe('on redirect', function(){
    it('should follow Location', function(done){
      var redirects = [];

      request
      .get('http://localhost:3003/')
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(res){
        var arr = [];
        arr.push('/movies');
        arr.push('/movies/all');
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
    })

    it('should retain header fields', function(done){
      request
      .get('http://localhost:3003/header')
      .set('X-Foo', 'bar')
      .end(function(res){
        res.body.should.have.property('x-foo', 'bar');
        done();
      });
    })

    it('should remove Content-* fields', function(done){
      request
      .post('http://localhost:3003/header')
      .type('txt')
      .set('X-Foo', 'bar')
      .set('X-Bar', 'baz')
      .send('hey')
      .end(function(res){
        res.body.should.have.property('x-foo', 'bar');
        res.body.should.have.property('x-bar', 'baz');
        res.body.should.not.have.property('content-type');
        res.body.should.not.have.property('content-length');
        res.body.should.not.have.property('transfer-encoding');
        done();
      });
    })

    describe('when relative', function(){
      it('should construct the FQDN', function(done){
        var redirects = [];

        request
        .get('http://localhost:3003/relative')
        .on('redirect', function(res){
          redirects.push(res.headers.location);
        })
        .end(function(res){
          var arr = [];
          redirects.should.eql(['/tobi']);
          res.text.should.equal('tobi');
          done();
        });
      })
    })
  })

  describe('req.redirects(n)', function(){
    it('should alter the default number of redirects to follow', function(done){
      var redirects = [];

      request
      .get('http://localhost:3003/')
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(res){
        var arr = [];
        assert(res.redirect, 'res.redirect');
        arr.push('/movies');
        arr.push('/movies/all');
        redirects.should.eql(arr);
        res.text.should.match(/Moved Temporarily/);
        done();
      });
    })
  })

  describe('on POST', function(){
    it('should redirect as GET', function(done){
      var redirects = [];

      request
      .post('http://localhost:3003/movie')
      .send({ name: 'Tobi' })
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(res){
        var arr = [];
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
    })
  })
})
