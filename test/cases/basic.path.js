
require('./../common');

var just = require('just')
  , express = require('express')
  , app = express.createServer();

just.should.have.property('version');

app.get('/foo', function(req, res){
  res.end('Hello from foo');
});

app.listen(3000, function(){
  var req = just.request('GET', 'http://localhost:3000/foo');

  req.on('response', function(res){
    var buf = '';
    res.statusCode.should.equal(200);
    res.on('data', function(chunk){ buf += chunk; });
    res.on('end', function(){
      buf.should.equal('Hello from foo');
      app.close();
    });
  });

  req.end();
});
