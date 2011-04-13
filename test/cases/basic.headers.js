
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/', function(req, res){
  res.end(req.headers['x-requested-by']);
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .buffer()
    .header('X-Requested-By', 'SuperAgent')
    .on('response', function(res){
    res.on('end', function(){
      res.body.should.equal('SuperAgent');
      app.close();
    });
  }).end();
});
