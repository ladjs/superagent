
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , should = require('should')
  , app = express.createServer();

var pending = 3;

app.get('/', function(req, res){
  res.send('<p>Hello</p>');
});

app.get('/json', function(req, res){
  res.send(req.query);
});

app.get('/octet', function(req, res){
  res.write('foo');
  res.write('bar');
  res.write('baz');
  res.end();
});

app.listen(3000, function(){
  agent.get('http://localhost:3000/', function(err, res, body){
    res.statusCode.should.equal(200);
    res.body.should.equal('<p>Hello</p>');
    body.should.equal(res.body);
    --pending || app.close();
  });
  
  agent.get('http://localhost:3000/json?foo=bar', function(err, res, body){
    res.statusCode.should.equal(200);
    res.body.should.eql({ foo: 'bar' });
    body.should.equal(res.body);
    --pending || app.close();
  });
  
  agent.get('http://localhost:3000/octet', function(err, res, body){
    res.statusCode.should.equal(200);
    should.equal(null, res.body);
    should.equal(null, body);
    --pending || app.close();
  });
});
