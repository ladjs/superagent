
var request = require('../../')
  , express = require('express')
  , assert = require('assert')
  , app = express.createServer();

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.listen(3005);

// TODO: "response" event should be a Response

describe('Request', function(){
  describe('#part()', function(){
    var req = request.post('http://localhost:3005/echo');

    req
      .part()
      .set('Content-Type', 'image/png')
      .write('some image data');

    req.end(function(res){
      var ct = res.header['content-type'];
      ct.should.include.string('multipart/mixed; boundary="');
      var boundary = ct.match(/boundary="(.*)"/)[1];

      var body = '\r\n';
      body += '--' + boundary + '\r\n';
      body += 'Content-Type: image/png\r\n';
      body += '\r\n';
      body += 'some image data';
      body += '\r\n--' + boundary + '--';

      assert(body == res.text, 'invalid multipart response');
    });
  })
})