
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
  res.redirect('/two');
});

app.get('/two', function(req, res){
  res.send('done');
});

app.listen(3000, function(){
  var req = agent.request('GET', 'http://localhost:3000')
    .buffer()
    .on('response', function(res){
      res.statusCode.should.equal(200);

      res.on('end', function(){
        res.body.should.equal('done');
        redirects.should.eql(['http://localhost:3000/one', 'http://localhost:3000/two']);
        app.close();
      });
    });

  req.on('redirect', function(location){
    redirects.push(location);
  });
  
  req.end();
});
