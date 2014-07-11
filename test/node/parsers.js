
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , fs = require('fs')
  , app = express();

app.get('/manny', function(req, res){
  res.send('{"name":"manny"}');
});


var img = fs.readFileSync(__dirname + '/fixtures/test.png');

app.get('/image', function(req, res){
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');
});

app.listen(3033);

describe('req.parse(fn)', function(){
  it('should take precedence over default parsers', function(done){
    request
    .get('http://localhost:3033/manny')
    .parse(request.parse['application/json'])
    .end(function(res){
      assert(res.ok);
      assert('{"name":"manny"}' == res.text);
      assert('manny' == res.body.name);
      done();
    });
  })

  it('should be the only parser', function(done){
    request
    .get('http://localhost:3033/image')
    .parse(function(res, fn) {
      res.on('data', function() {});
    })
    .end(function(res){
      assert(res.ok);
      assert(res.text === undefined);
      res.body.should.eql({});
      done();
    });
  })

  it('should emit error if parser throws', function(done){
    request
    .get('http://localhost:3033/manny')
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
    .get('http://localhost:3033/manny')
    .parse(function(res, fn) {
      fn(new Error('I am broken'));
    })
    .on('error', function(err) {
      err.message.should.equal('I am broken');
      done();
    })
    .end()
  })
})
