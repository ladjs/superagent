
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

var redirects = [];

agent.should.have.property('version');

app.get('/', function(req, res){
  res.redirect('/one?' + req.url.split('?')[1]);
});

app.get('/one', function(req, res){
  res.redirect('/two?' + req.url.split('?')[1]);
});

app.get('/two', function(req, res){
  res.send('done: ' + req.query.foo);
});

app.listen(3000, function(){
  var req = agent.request('GET', 'http://localhost:3000?foo=bar')
    .buffer()
    .on('response', function(res){
      res.statusCode.should.equal(200);

      res.on('end', function(){
        res.body.should.equal('done: bar');
        redirects.should.eql(['http://localhost:3000/one?foo=bar', 'http://localhost:3000/two?foo=bar']);
        app.close();
      });
    });

  req.on('redirect', function(location){
    redirects.push(location);
  });
  
  req.end();
});
