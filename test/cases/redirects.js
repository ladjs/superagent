
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

agent.should.have.property('version');

app.get('/', function(req, res){
  res.redirect('/one');
});

app.get('/one', function(req, res){
  res.redirect('/two');
});

app.get('/two', function(req, res){
  res.end('done');
});

app.listen(3000, function(){
  agent.request('GET', 'http://localhost:3000')
    .buffer()
    .on('end', function(res){
      console.log(res.statusCode);
    }).end();
});
