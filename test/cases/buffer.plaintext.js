
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/', function(req, res){
  res.end('Hello');
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .buffer()
    .on('response', function(res){
    res.on('end', function(){
      res.statusCode.should.equal(200);
      res.body.should.equal('Hello');
      app.close();
    });
  }).end();
});
