
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

var redirects = [];

agent.should.have.property('version');

app.get('/', function(req, res){
  res.send(302, { 'Location': '/one?foo=bar' })
});

app.get('/one', function(req, res){
  res.send(302, { 'Location': '/two?foo=bar' })
});

app.get('/two', function(req, res){
  res.send('done: ' + req.query.foo);
});

app.listen(3000, function(){
  var req = agent.request('GET', 'http://localhost:3000')
    .parse()
    .on('response', function(res){
      res.statusCode.should.equal(200);

      res.on('end', function(){
        res.body.should.equal('done: bar');
        redirects.should.eql(['/one?foo=bar', '/two?foo=bar']);
        app.close();
      });
    });

  req.on('redirect', function(location){
    redirects.push(location);
  });
  
  req.end();
});
