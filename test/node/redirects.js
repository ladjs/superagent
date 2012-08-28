
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
        arr.push('//localhost:3003/movies');
        arr.push('//localhost:3003/movies/all');
        arr.push('//localhost:3003/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
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
        arr.push('//localhost:3003/movies');
        arr.push('//localhost:3003/movies/all');
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
        arr.push('//localhost:3003/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
    })
  })
})