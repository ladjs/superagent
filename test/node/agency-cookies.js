var express = require('express')
  , app = express()
  , request = require('../../')
  , assert = require('assert')
  , should = require('should');

app.use(express.cookieParser());
app.use(express.session({ secret: 'secret' }));

app.get('/setcookie', function (req, res) {
  res.cookie('foo', 'bar');
  res.send(200, 'cookie set');
})

app.get('/getcookie', function (req, res) {
  res.send(200, 'foo cookie: ' + req.cookies.foo);
})

app.listen(4001);

describe('request', function() {
  describe('persistent agent', function() {
    var agent1 = request.agent();

    it('should set cookie in end callback', function (done) {
      agent1
      .get('http://localhost:4001/setcookie')
      .end(function (err, res) {
        agent1
        .get('http://localhost:4001/getcookie')
        .end(function (err, res) {
          should.not.exist(err);
          res.should.have.status(200);
          res.text.should.include('bar');
          done()
        })
      })
    })
  });
});