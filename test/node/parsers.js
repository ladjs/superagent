var assert = require('assert');
var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;

describe('req.parse(fn)', function(){
  it('should take precedence over default parsers', function(done){
    request
    .get(base + '/manny')
    .parse(request.parse['application/json'])
    .end(function(err, res){
      assert(res.ok);
      assert.equal('{"name":"manny"}', res.text);
      assert.equal('manny', res.body.name);
      done();
    });
  })

  it('should be the only parser', function(){
    return request
    .get(base + '/image')
    .parse(function(res, fn) {
      res.on('data', function() {});
    })
    .then(function(res){
      assert(res.ok);
      assert.strictEqual(res.text, undefined);
      res.body.should.eql({});
    });
  })

  it('should emit error if parser throws', function(done){
    request
    .get(base + '/manny')
    .parse(function() {
      throw new Error('I am broken');
    })
    .on('error', function(err) {
      err.message.should.equal('I am broken');
      done();
    })
    .end();
  })

  it('should emit error if parser returns an error', function(done){
    request
    .get(base + '/manny')
    .parse(function(res, fn) {
      fn(new Error('I am broken'));
    })
    .on('error', function(err) {
      err.message.should.equal('I am broken');
      done();
    })
    .end()
  })

  it('should not emit error on chunked json', function(done){
    request
    .get(base + '/chunked-json')
    .end(function(err){
      assert(!err);
      done();
    });
  })

  it('should not emit error on aborted chunked json', function(done){
    var req = request
    .get(base + '/chunked-json')
    .end(function(err){
      assert.ifError(err);
      done();
    });

    setTimeout(function(){req.abort()},50);
  });

  it('should not reject promise on aborted chunked json', function(){
    var req = request.get(base + '/chunked-json')
    setTimeout(function(){req.abort()},50);
    return req;
  });
})
