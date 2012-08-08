var express = require('express')
  , app = express.createServer()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should');

app.use(express.cookieParser());

app.get('/', function(req, res) {
  return res.send(200);
});

app.get('/gobble', function(req, res) {
  res.cookie('chocolateChip', 'tasty');
  res.cookie('peanutButter', 'delicious');
  return res.send(200);
});

app.get('/puke', function(req, res) {
  res.clearCookie('chocolateChip');
  return res.send(200);
});

app.listen(4001);

describe('response', function() {
  describe('cookies', function() {
    it('should be empty by default', function(done) {
      request
        .get('http://localhost:4001/')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.cookies.should.eql([]);
          return done();
        });
    });
    it('should populate set cookies', function(done) {
      request
        .get('http://localhost:4001/gobble')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.cookies[0].toString().should.eql('chocolateChip=tasty; Path=/');
          res.cookies[1].toString().should.eql('peanutButter=delicious; Path=/');
          return done();
        });
    });
    it('should populate cleared cookies', function(done) {
      request
        .get('http://localhost:4001/puke')
        .end(function(err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.cookies[0].toString().should.eql('chocolateChip=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/');
          return done();
        });
    });
  });
});