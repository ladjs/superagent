var express = require('express')
  , app = express.createServer()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should');

app.use(express.cookieParser());
app.use(express.session({
  secret: 'secret'
}));

app.post('/signin', function(req, res) {
  req.session.user = 'hunter@hunterloftis.com';
  return res.send(200);
});

app.get('/dashboard', function(req, res) {
  if (req.session.user) {
    return res.send(200);
  }
  return res.send(401);
});

app.all('/signout', function(req, res) {
  req.session.regenerate(function() {
    return res.send(200);
  });
});

app.listen(4000);

describe('request', function() {
  describe('persistent agent', function() {
    var agent1 = request.agent();
    var agent2 = request.agent();

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