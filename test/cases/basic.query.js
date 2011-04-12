
require('./../common');

var just = require('just')
  , express = require('express')
  , app = express.createServer();

just.should.have.property('version');

app.get('/search', function(req, res){
  res.end(req.query.q);
});

app.listen(3000, function(){
  var req = just.request('GET', 'http://localhost:3000/search?q=something');

  req.on('response', function(res){
    var buf = '';
    res.statusCode.should.equal(200);
    res.on('data', function(chunk){ buf += chunk; });
    res.on('end', function(){
      buf.should.equal('something');
      app.close();
    });
  });

  req.end();
});
