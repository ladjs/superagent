var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , app = express()
  , url = require('url');

app.get('/ok', function(req, res) {
  res.status(200).send('OK');
});

app.get('/210', function(req, res) {
  res.sendStatus(210);
});

app.get('/500', function(req, res) {
  res.sendStatus(500);
});

app.get('/400', function(req, res){
  res.sendStatus(400);
});


app.listen(8889);

describe('request.acceptedStatus()', function(){
  it('let 200 through by default', function(done){
    request
    .get('http://localhost:8889/ok')
    .end(function(err, res) {
      assert(!err);
      assert(res.text == 'OK');
      assert(res.status == 200);
      done();
    });
  });

  it('shouldn\'t let 400 through by default', function(done){
    request
    .get('http://localhost:8889/400')
    .end(function(err, res) {
      assert(err);
      assert(err.status == 400);
      done();
    });
  });

  it('should allow 400 if configured via function', function(done) {
    request
    .get('http://localhost:8889/400')
    .acceptedStatus(function(status) { return true; })
    .end(function(err, res) {
      assert(!err);
      assert(res.status == 400);
      done();
    });
  });

  it('should allow 400 if configured via array', function(done) {
    request
    .get('http://localhost:8889/400')
    .acceptedStatus([400])
    .end(function(err, res) {
      assert(!err);
      assert(res.status == 400);
      done();
    });
  });

  it('should not allow other than specified status codes when set', function(done) {
    request
    .get('http://localhost:8889/ok')
    .acceptedStatus([400])
    .end(function(err, res) {
      assert(err);
      assert(err.status == 200);
      done();
    });
  });

  it('should allow 200 and 400 and disallow 210 and 500 with [20x, 4XX] format', function(done) {
    request
    .get('http://localhost:8889/ok')
    .acceptedStatus(['20x', '4XX'])
    .end(function(err, res) {
      assert(!err);
      assert(res.status == 200);

      request
      .get('http://localhost:8889/400')
      .acceptedStatus(['20x', '4XX'])
      .end(function(err, res) {
        assert(!err);
        assert(res.status == 400);

        request
        .get('http://localhost:8889/210')
        .acceptedStatus(['20x', '4XX'])
        .end(function(err, res) {
          assert(err);
          assert(err.status == 210);

          request
          .get('http://localhost:8889/500')
          .acceptedStatus(['20x', '4XX'])
          .end(function(err, res) {
            assert(err);
            assert(err.status == 500);

            done();
          });
        });
      });
    });
  });
});
