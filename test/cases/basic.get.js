
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

agent.should.have.property('version');

app.get('/', function(req, res){
  res.end('Hello');
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .on('response', function(res){
    var buf = '';
    res.statusCode.should.equal(200);
    res.on('data', function(chunk){ buf += chunk; });
    res.on('end', function(){
      buf.should.equal('Hello');
      app.close();
    });
  }).end();
});
