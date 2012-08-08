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

app.listen(4000);

describe('persistent agent', function() {
  var agent = request.agent();

  it('should start with empty cookies', function(done) {
    agent
      .get('http://localhost:4000/dashboard')
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(401);
        return done();
      });
  });

  it('should create cookies', function(done) {
    agent
      .post('http://localhost:4000/signin')
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        should.exist(res.headers['set-cookie']);
        return done();
      });
  });

  it('should persist cookies across requests', function(done) {
    agent
      .get('http://localhost:4000/dashboard')
      .end(function(err, res) {
        should.not.exist(err);
        res.should.have.status(200);
        return done();
      });
  });
});