
var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

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

app.listen(3003);

// TODO: "response" event should be a Response

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
        arr.push('http://localhost:3003/movies');
        arr.push('http://localhost:3003/movies/all');
        arr.push('http://localhost:3003/movies/all/0');
        redirects.should.eql(arr);
        res.text.should.equal('first movie page');
        done();
      });
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
        arr.push('http://localhost:3003/movies');
        arr.push('http://localhost:3003/movies/all');
        redirects.should.eql(arr);
        res.text.should.match(/Moved Temporarily/);
        done();
      });
    })
  })
})