
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , fs = require('fs')
  , app = express();

app.get('/manny', function(req, res){
  res.status(200).json({name:"manny"});
});


var img = fs.readFileSync(__dirname + '/fixtures/test.png');

app.get('/image', function(req, res){
  res.writeHead(200, {'Content-Type': 'image/png' });
  res.end(img, 'binary');
});

app.get('/chunked-json', function(req, res){
  res.set('content-type', 'application/json');
  res.set('Transfer-Encoding', 'chunked');

  var chunk = 0;
  var interval = setInterval(function(){
    chunk++;
    if(chunk === 1) res.write('{ "name_' + chunk + '": "');
    if(chunk > 1) res.write('value_' + chunk + '", "name_' + chunk + '": "');
    if(chunk === 10) {
      clearInterval(interval);
      res.write('value_' + chunk + '"}');
      res.end();
    }
  },10);
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('req.parse(fn)', function(){
  it('should take precedence over default parsers', function(done){
    request
    .get(base + '/manny')
    .parse(request.parse['application/json'])
    .end(function(err, res){
      assert(res.ok);
      assert('{"name":"manny"}' == res.text);
      assert('manny' == res.body.name);
      done();
    });
  })

  it('should be the only parser', function(done){
    request
    .get(base + '/image')
    .parse(function(res, fn) {
      res.on('data', function() {});
    })
    .end(function(err, res){
      assert(res.ok);
      assert(res.text === undefined);
      res.body.should.eql({});
      done();
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
      assert(!err);
      done();
    });

    setTimeout(function(){req.abort()},50);
  })

})
