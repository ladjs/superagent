
require('./../common');

var agent = require('superagent')
  , express = require('express')
  , app = express.createServer();

app.post('/', function(req, res){
  var buf = '';
  req.headers.should.have.property('content-type', 'application/json');
  req.on('data', function(chunk){ buf += chunk; });
  req.on('end', function(){
    buf.should.equal('{"foo":"bar"}');
    app.close();
  });
  res.end();
});

app.listen(3000, function(){
  var req = agent
    .post('http://localhost:3000')
    .header('Content-Type', 'application/json');

  req.write('{"foo":');
  req.write('"bar"}');
  req.end();
});
