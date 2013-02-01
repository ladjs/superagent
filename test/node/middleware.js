var request = require('../..')
  , express = require('express')
  , should = require("should")
  , app = express();

app.get('/', function(req, res){
  res.set('x-test-res', req.get('x-test'));
  res.send(req.get('x-test'));
});

app.listen(3045);

describe('req.use(Function)', function(){

  it('should call the middleware passed', function(done){
    request
      .get('http://localhost:3045/')
      .use(function(req, next) {
        req.setHeader("x-test","This is a test");
        next();
      })
      .end(function(err, res){
        if(err) return done(err);
        res.text.should.eql("This is a test");
        done();
      });
  });

  it("should stop a request on middleware error", function(done) {
    request
      .get('http://localhost:3045/')
      .use(function(req, next) {
        next(new Error("Testing"));
      })
      .end(function(err, res){
        should.exist(err);
        done();
      });
  });

  it("should call the res middleware", function(done) {
    request
      .get('http://localhost:3045/')
      .use(function(req, next) {
        req.setHeader("x-test","This is a test");
        next(null, function(res, prev) {
          res.on('data', function(data) {
            res.headers['x-test-inject'] = "This is a header";
          });
          prev();
        });
      })
      .end(function(err, res){
        should.exist(res);
        should.exist(res.headers['x-test-inject']);
        done();
      });
  });

});
