
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer()
  , assert = require('assert');

app.get('/', function(req, res){
  res.send('{ invalid:', { 'Content-Type': 'application/json' });
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .buffer()
    .on('response', function(res){
    res.on('end', function(){
      assert.fail('end called');
    });

    res.on('error', function(err){
      err.message.should.equal('Unexpected token ILLEGAL');
      app.close();
    });
  }).end();
});
