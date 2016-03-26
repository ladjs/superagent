
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , should = require('should');

app.get('/', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.send('first movie page');
});

app.get('/movies/random', function(req, res){
  res.redirect('/movie/4');
});

app.get('/movie/4', function(req, res){
  setTimeout(function(){
    res.send('not-so-random movie');
  }, 1000);
});

app.post('/movie', function(req, res){
  res.redirect('/movies/all/0');
});

app.put('/redirect-303', function(req, res){
  res.redirect(303, '/reply-method');
});

app.put('/redirect-307', function(req, res){
  res.redirect(307, '/reply-method');
});

app.put('/redirect-308', function(req, res){
  res.redirect(308, '/reply-method');
});

app.all('/reply-method', function(req, res){
  res.send('method=' + req.method.toLowerCase());
});

app.get('/tobi', function(req, res){
  res.send('tobi');
});

app.get('/relative', function(req, res){
  res.redirect('tobi');
});

app.get('/relative/sub', function(req, res){
  res.redirect('../tobi');
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

app.get('/bad-redirect', function(req, res){
  res.status(307).end();
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('request', function(){
  describe('on redirect', function(){
    it('should follow Location', function(done){
      var redirects = [];

      request
      .get(base)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
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
      .get(base + '/header')
      .set('X-Foo', 'bar')
      .end(function(err, res){
        res.body.should.have.property('x-foo', 'bar');
        done();
      });
    })

    it('should remove Content-* fields', function(done){
      request
      .post(base + '/header')
      .type('txt')
      .set('X-Foo', 'bar')
      .set('X-Bar', 'baz')
      .send('hey')
      .end(function(err, res){
        res.body.should.have.property('x-foo', 'bar');
        res.body.should.have.property('x-bar', 'baz');
        res.body.should.not.have.property('content-type');
        res.body.should.not.have.property('content-length');
        res.body.should.not.have.property('transfer-encoding');
        done();
      });
    })

    it('should retain cookies', function(done){
      request
      .get(base + '/header')
      .set('Cookie', 'foo=bar;')
      .end(function(err, res){
        res.body.should.have.property('cookie', 'foo=bar;');
        done();
      });
    })

    it('should preserve timeout across redirects', function(done){
      request
      .get(base + '/movies/random')
      .timeout(250)
      .end(function(err, res){
        assert(err instanceof Error, 'expected an error');
        err.should.have.property('timeout', 250);
        done();
      });
    })

    it('should not resend query parameters', function(done) {
      var redirects = [];
      var query = [];

      request
      .get(base + '/?foo=bar')
      .on('redirect', function(res){
        query.push(res.headers.query);
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        var arr = [];
        arr.push('/movies');
        arr.push('/movies/all');
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');

        query.should.eql(['{"foo":"bar"}', '{}', '{}']);
        res.headers.query.should.eql('{}');
        done();
      });
    })

    it('should handle no location header', function(done){
      request
      .get(base + '/bad-redirect')
      .end(function(err, res){
        err.message.should.equal('No location header for redirect');
        done();
      });
    })

    describe('when relative', function(){
      it('should redirect to a sibling path', function(done){
        var redirects = [];

        request
        .get(base + '/relative')
        .on('redirect', function(res){
          redirects.push(res.headers.location);
        })
        .end(function(err, res){
          var arr = [];
          redirects.should.eql(['tobi']);
          res.text.should.equal('tobi');
          done();
        });
      })

      it('should redirect to a parent path', function(done){
        var redirects = [];

        request
        .get(base + '/relative/sub')
        .on('redirect', function(res){
          redirects.push(res.headers.location);
        })
        .end(function(err, res){
          var arr = [];
          redirects.should.eql(['../tobi']);
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
      .get(base)
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        var arr = [];
        assert(res.redirect, 'res.redirect');
        arr.push('/movies');
        arr.push('/movies/all');
        redirects.should.eql(arr);
        res.text.should.match(/Moved Temporarily|Found/);
        done();
      });
    })
  })

  describe('on POST', function(){
    it('should redirect as GET', function(done){
      var redirects = [];

      request
      .post(base + '/movie')
      .send({ name: 'Tobi' })
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        var arr = [];
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
    })
  })

  describe('on POST using multipart/form-data', function(){
    it('should redirect as GET', function(done){
      var redirects = [];

      request
      .post(base + '/movie')
      .type('form')
      .field('name', 'Tobi')
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        var arr = [];
        arr.push('/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
    })
  })

  describe('on 303', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-303')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=get');
        done();
      })
    })
  })

  describe('on 307', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-307')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=put');
        done();
      })
    })
  })

  describe('on 308', function(){
    it('should redirect with same method', function(done){
      request
      .put(base + '/redirect-308')
      .send({msg: "hello"})
      .redirects(1)
      .on('redirect', function(res) {
        res.headers.location.should.equal('/reply-method')
      })
      .end(function(err, res){
        res.text.should.equal('method=put');
        done();
      })
    })
  })
})
