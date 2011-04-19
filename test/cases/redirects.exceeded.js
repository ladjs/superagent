
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

var redirects = [];

agent.should.have.property('version');

app.get('/', function(req, res){
  res.redirect('/one');
});

app.get('/one', function(req, res){
  res.redirect('/');
});

app.listen(3000, function(){
  var req = agent.request('GET', 'http://localhost:3000')
    .parse()
    .on('response', function(res){
      res.statusCode.should.equal(200);

      res.on('end', function(){
        should.fail('end called');
      });
    });

  req.on('error', function(err){
    redirects.should.have.length(6);
    err.message.should.equal('exceeded maximum of 5 redirects');
    app.close();
  });

  req.on('redirect', function(location){
    redirects.push(location);
  });
  
  req.end();
});
