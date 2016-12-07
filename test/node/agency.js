require('should-http');

var express = require('express')
  , app = express()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should')
  , cookieParser = require('cookie-parser')
  , session = require('express-session');

app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.post('/signin', function(req, res) {
  req.session.user = 'hunter@hunterloftis.com';
  res.redirect('/dashboard');
});

app.post('/setcookie', function(req, res) {
  res.cookie('cookie', 'jar');
  res.sendStatus(200);
});

app.get('/getcookie', function(req, res) {
  res.status(200).send(req.cookies.cookie);
});

app.get('/dashboard', function(req, res) {
  if (req.session.user) return res.status(200).send('dashboard');
  res.status(401).send('dashboard');
});

app.all('/signout', function(req, res) {
  req.session.regenerate(function() {
    res.status(200).send('signout');
  });
});

app.get('/', function(req, res) {
  if (req.session.user) return res.redirect('/dashboard');
  res.status(200).send('home');
});

app.post('/redirect', function(req, res) {
  res.redirect('/simple');
});

app.get('/simple', function(req, res) {
  res.status(200).send('simple');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('request', function() {
  describe('persistent agent', function() {
    var agent1 = request.agent();
    var agent2 = request.agent();
    var agent3 = request.agent();
    var agent4 = request.agent();

    it('should gain a session on POST', function() {
      return agent3
        .post(base + '/signin')
        .then(function(res) {
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.containEql('dashboard');
        });
    });

    it('should start with empty session (set cookies)', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          should.exist(res.headers['set-cookie']);
          done();
        });
    });

    it('should gain a session (cookies already set)', function() {
      return agent1
        .post(base + '/signin')
        .then(function(res) {
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.containEql('dashboard');
        });
    });

    it('should persist cookies across requests', function() {
      return agent1
        .get(base + '/dashboard')
        .then(function(res) {
          res.should.have.status(200);
        });
    });

    it('should have the cookie set in the end callback', function() {
      return agent4
        .post(base + '/setcookie')
        .then(function() {
          return agent4.get(base + '/getcookie')
        })
        .then(function(res) {
          res.should.have.status(200);
          assert.strictEqual(res.text, 'jar');
        });
    });

    it('should not share cookies', function(done) {
      agent2
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          done();
        });
    });

    it('should not lose cookies between agents', function() {
      return agent1
        .get(base + '/dashboard')
        .then(function(res) {
          res.should.have.status(200);
        });
    });

    it('should be able to follow redirects', function() {
      return agent1
        .get(base)
        .then(function(res) {
          res.should.have.status(200);
          res.text.should.containEql('dashboard');
        });
    });

    it('should be able to post redirects', function() {
      return agent1
        .post(base + '/redirect')
        .send({ foo: 'bar', baz: 'blaaah' })
        .then(function(res) {
          res.should.have.status(200);
          res.text.should.containEql('simple');
          res.redirects.should.eql([base + '/simple']);
        });
    });

    it('should be able to limit redirects', function(done) {
      agent1
        .get(base)
        .redirects(0)
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(302);
          res.redirects.should.eql([]);
          res.header.location.should.equal('/dashboard');
          done();
        });
    });

    it('should be able to create a new session (clear cookie)', function() {
      return agent1
        .post(base + '/signout')
        .then(function(res) {
          res.should.have.status(200);
          should.exist(res.headers['set-cookie']);
        });
    });

    it('should regenerate with an empty session', function(done) {
      agent1
        .get(base + '/dashboard')
        .end(function(err, res) {
          should.exist(err);
          res.should.have.status(401);
          should.not.exist(res.headers['set-cookie']);
          done();
        });
    });
  });
});
