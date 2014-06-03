var express = require('express')
  , app = express()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should');

app.use(express.cookieParser());
app.use(express.session({ secret: 'secret' }));

app.post('/signin', function(req, res) {
  res.send(200, { token: 'mytoken', user: { name: 'hunter smith', email: 'hunter@hunterloftis.com' } });
});

app.get('/api', function(req, res) {
  var authHeader = req.headers['authenticate'];
  if (authHeader) {
    return res.send(200, '{ status: ok }');
  }
  res.send(401, {error: 'not logged in'});
});

app.listen(4040);

describe('tokens', function() {
  describe('persistence', function() {

    var agent1 = request.agent();
    var agent2 = request.agent();

    it('no token', function(done) {
      agent1
        .get('http://localhost:4040/api')
        .end(function(err, res) {
          should.not.exist(err);
          res.status.should.equal(401);
          done();
        });
    });

    it('receive token to set', function(done) {
      agent2
        .post('http://localhost:4040/signin')
        .end(function(err, res) {
          should.not.exist(err);
          res.status.should.equal(200);
          res.body.should.have.property('token');
          agent2.saveToken(res.body.token);
          done();
        });
    });

    it('send token', function(done) {
      agent2
        .get('http://localhost:4040/api')
        .end(function(err, res) {
          should.not.exist(err);
          res.status.should.equal(200);
          done();
        });
    });
  });
});
