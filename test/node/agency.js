var express = require('express')
  , app = express()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should');

app.use(express.cookieParser());
app.use(express.session({
  secret: 'secret'
}));

app.use(function(req, res, next) {
  console.log(req.url);
  return next();
});

app.post('/signin', function(req, res) {
  console.log("req.headers:", req.headers);
  req.session.user = 'hunter@hunterloftis.com';
  return res.redirect('/dashboard');
});

app.get('/dashboard', function(req, res) {
  console.log("req.headers:", req.headers);
  if (req.session.user) {
    return res.send(200, 'dashboard');
  }
  return res.send(401, 'dashboard');
});

app.all('/signout', function(req, res) {
  req.session.regenerate(function() {
    return res.send(200, 'signout');
  });
});

app.get('/', function(req, res) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.send(200, 'home');
});

app.post('/redirect', function(req, res) {
  return res.redirect('/simple');
});

app.get('/simple', function(req, res) {
  return res.send(200, 'simple');
});

app.listen(4000);

describe('request', function() {
  describe('persistent agent', function() {
    var agent1 = request.agent();
    var agent2 = request.agent();
    var agent3 = request.agent();

    it('should gain a session on POST', function(done) {
      agent3
        .post('http://localhost:4000/signin')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.include('dashboard');
          return done();
        });
    });

    it('should start with empty session (set cookies)', function(done) {
      agent1
        .get('http://localhost:4000/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(401);
          should.exist(res.headers['set-cookie']);
          return done();
        });
    });

    it('should gain a session (cookies already set)', function(done) {
      agent1
        .post('http://localhost:4000/signin')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.not.exist(res.headers['set-cookie']);
          res.text.should.include('dashboard');
          return done();
        });
    });

    it('should persist cookies across requests', function(done) {
      agent1
        .get('http://localhost:4000/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          return done();
        });
    });

    it('should not share cookies', function(done) {
      agent2
        .get('http://localhost:4000/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(401);
          return done();
        });
    });

    it('should not lose cookies between agents', function(done) {
      agent1
        .get('http://localhost:4000/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          return done();
        });
    });

    it('should be able to follow redirects', function(done) {
      agent1
        .get('http://localhost:4000/')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.text.should.include('dashboard');
          return done();
        });
    });

    it('should be able to post redirects', function(done) {
      agent1
        .post('http://localhost:4000/redirect')
        .send({ foo: 'bar', baz: 'blaaah' })
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.text.should.include('simple');
          res.redirects.should.eql(['http://localhost:4000/simple']);
          return done();
        });
    });

    it('should be able to limit redirects', function(done) {
      agent1
        .get('http://localhost:4000/')
        .redirects(0)
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(302);
          res.redirects.should.eql([]);
          res.header.location.should.equal('//localhost:4000/dashboard');
          return done();
        });
    });

    it('should be able to create a new session (clear cookie)', function(done) {
      agent1
        .post('http://localhost:4000/signout')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          should.exist(res.headers['set-cookie']);
          return done();
        });
    });

    it('should regenerate with an empty session', function(done) {
      agent1
        .get('http://localhost:4000/dashboard')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(401);
          should.not.exist(res.headers['set-cookie']);
          return done();
        });
    });
  });
});