var EventEmitter = require('events').EventEmitter
  , request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express()
  , app2 = express()
  , app3 = express()
  , should = require('should')

app.use(express.basicAuth('tobi', 'learnboost'));
app2.use(express.basicAuth('zulunko', 'password'));

app.get('/', function(req, res){
  res.redirect('http://localhost:53253');
});

app.get('/explosions', function(req, res){
  res.redirect('/walkaway');
});

app.get('/walkaway', function(req, res){
  res.end('so cool!');
});

app2.get('/', function(req, res){
  res.end('you win!');
});

app2.get('/turtles', function(req, res){
  res.end('turtles!');
});

app3.get('/', function(req, res){
  res.redirect('http://localhost:53253/turtles');
});

app.listen(53252);

app2.listen(53253);

app3.listen(53254);

describe('Redirect auth', function() {
  describe('when on same authorization', function() {
    it('should keep Authorization when using auth', function(done) {
      request
      .get('http://localhost:53252/explosions')
      .auth('tobi', 'learnboost')
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })

    it('should keep Authorization when using authmap', function(done) {
      request
      .get('http://localhost:53252/explosions')
      .authmap({'regex':'.*localhost.*', 'user':'tobi', 'pass':'learnboost'})
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })

    it('should fail with an incomplete authmap', function(done) {
      request
      .get('http://localhost:53252/explosions')
      .authmap({'regex':'.*localhost:53252/explosions.*', 'user':'tobi',
        'pass':'learnboost'})
      .end(function(res) {
        res.status.should.equal(401);
        done();
      });
    })

    it('should fail with an incorrect authmap', function(done) {
      request
      .get('http://localhost:53252/explosions')
      .authmap([
        {'regex':'.*localhost:53252/explosions.*', 'user':'tobi',
          'pass':'learnboost'},
        {'regex':'.*localhost:53252.*', 'user':'zulunko', 'pass':'password'}])
      .end(function(res) {
        res.status.should.equal(401);
        done();
      });
    })
  })

  describe('when going from no auth to auth', function() {
    it('should add authorization when using authmap', function(done) {
      request
      .get('http://localhost:53254/')
      .authmap({'regex':'.*localhost:53253.*', 'user':'zulunko',
        'pass':'password'})
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })

    it('should succeed when using auth', function(done) {
      request
      .get('http://localhost:53254/')
      .auth('zulunko', 'password')
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })

    it('should fail when using incorrect authmap', function(done) {
      request
      .get('http://localhost:53254/')
      .authmap({'regex':'.*localhost:53253.*', 'user':'tobi',
        'pass':'learnboost'})
      .end(function(res) {
        res.status.should.equal(401);
        done();
      });
    })
  })

  describe('when going from one auth to another', function() {
    it('should update authorization when using authmap', function(done) {
      request
      .get('http://localhost:53252/')
      .authmap([
        {'regex':'.*localhost:53252.*', 'user':'tobi', 'pass':'learnboost'},
        {'regex':'.*localhost:53253.*', 'user':'zulunko', 'pass':'password'}])
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })

    it('should fail when using auth', function(done) {
      request
      .get('http://localhost:53252/')
      .auth('tobi', 'learnboost')
      .end(function(res) {
        res.status.should.equal(401);
        done();
      });
    })

    it('should succeed with catch-all map entry', function(done) {
      request
      .get('http://localhost:53252/')
      .authmap([
        {'regex':'.*localhost:53253.*', 'user':'zulunko', 'pass':'password'},
        {'regex':'.*', 'user':'tobi', 'pass':'learnboost'}])
      .end(function(res) {
        res.status.should.equal(200);
        done();
      });
    })
  })

})

