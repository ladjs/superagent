
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.get('/search', function(req, res){
  res.contentType('txt');
  res.end(req.query.q);
});

app.listen(3000, function(){
  agent.get('http://localhost:3000/search', { q: 'something' })
    .parse()
    .on('response', function(res){
      res.on('end', function(){
        res.body.should.equal('something');
        app.close();
      });
    })
    .end();
});
