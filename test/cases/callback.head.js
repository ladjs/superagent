
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , should = require('should')
  , app = express.createServer();

app.get('/', function(req, res){
  res.send('<p>Hello</p>');
});

app.listen(3000, function(){
  agent.head('http://localhost:3000/', function(err, res, body){
    res.statusCode.should.equal(200);
    res.body.should.be.empty;
    body.should.be.empty;
    app.close();
  });
});
