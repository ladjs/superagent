
var request = require('../..')
  , express = require('express')
  , assert = require('better-assert')
  , iconv = require('iconv-lite')
  , app = express();

app.get('/manny', function(req, res){
  res.send('{"name":"manny"}');
});

app.get('/gbk', function (req, res) {
  res.type('html');
  var buf = iconv.encode('你好', 'gbk');
  res.send(buf);
});

app.get('/big5', function (req, res) {
  res.type('html');
  var buf = iconv.encode('你好', 'big5');
  res.send(buf);
});

app.get('/utf-8', function (req, res) {
  res.type('html');
  var buf = new Buffer('你好');
  res.send(buf);
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
  });

  it('should parse gbk encoding page', function () {
    request
      .get('http://localhost:3033/gbk')
      .decode('gbk')
      .end(function (res) {
        res.text.should.equal('你好');
      });
  });

  it('should parse big5 encoding page', function () {
    request
      .get('http://localhost:3033/big5')
      .decode('big5')
      .end(function (res) {
        res.text.should.equal('你好');
      });
  });

  it('should parse utf-8 encoding page', function () {
    request
      .get('http://localhost:3033/utf-8')
      .decode('utf-8')
      .end(function (res) {
        res.text.should.equal('你好');
      });
  });
});