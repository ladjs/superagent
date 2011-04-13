
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/', function(req, res){
  res.send(req.headers['x-requested-by'] + ':' + req.headers['x-tobi']);
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .buffer()
    .header('X-Requested-By', 'SuperAgent')
    .header('X-Tobi', 'rules')
    .on('response', function(res){
    res.on('end', function(){
      res.body.should.equal('SuperAgent:rules');
      app.close();
    });
  }).end();
});
