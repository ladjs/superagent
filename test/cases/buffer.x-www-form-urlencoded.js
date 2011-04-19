
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/', function(req, res){
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.send('user[name]=tj&user[email]=tj@vision-media.ca');
});

app.listen(3000, function(){
  agent
    .get('http://localhost:3000')
    .parse()
    .on('response', function(res){
    res.on('end', function(){
      res.statusCode.should.equal(200);
      res.body.should.eql({ user: { name: 'tj', email: 'tj@vision-media.ca' }});
      app.close();
    });
  }).end();
});
