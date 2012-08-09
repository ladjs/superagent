
var request = require('../../')
  , express = require('express')
  , app = express()
  , fs = require('fs');

app.use(express.bodyParser());

app.post('/', function(req, res){
  res.send(req.body);
});

app.listen(3020);

describe('request', function(){
  describe('act as a writable stream', function(){
    it('should format the url', function(done){
      var req = request.post('http://localhost:3020')
        , stream = fs.createReadStream('test/node/fixtures/user.json');

      req.type('json');

      req.on('response', function(res){
        res.body.should.eql({ name: 'tobi' });
        done();
      });

      stream.pipe(req);
    })
  })
})