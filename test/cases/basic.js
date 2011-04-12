
require('./../common');

var just = require('just')
  , express = require('express')
  , app = express.createServer();

just.should.have.property('version');

app.get('/', function(req, res){
  res.end('Hello');
});

app.listen(3000, function(){
  var req = just.request('GET', 'http://localhost:3000');

  req.on('response', function(res){
    res.statusCode.should.equal(200);
    app.close();
  });

  req.end();
});
