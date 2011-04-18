
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/', function(req, res){
  res.send('<p>Hello</p>');
});

app.listen(3000, function(){
  agent.get('http://localhost:3000/', function(err, res, body){
    res.statusCode.should.equal(200);
    res.body.should.equal('<p>Hello</p>');
    body.should.equal(res.body);
    app.close();
  });
});
