
var request = require('../..')
  , express = require('express')
  , app = express();

app.get('/', function(req, res){
  res.send(req.url);
});

app.listen(3100);

describe('combo path', function(){
  it('should work skip qs parse', function(done){
    request
    .get('http://localhost:3100/??a.js,b.js')
    .end(function(res){
      res.text.should.eql('/??a.js,b.js');
      done();
    });
  });
});
