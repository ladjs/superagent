
var request = require('../../')
  , express = require('express')
  , exec = require('child_process').exec
  , app = express()
  , fs = require('fs');

app.use(express.bodyParser());

app.post('/', function(req, res){
  res.send(req.body);
});

app.listen(3020);

describe('request pipe', function(){
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
  describe('should act as a readable stream', function(){
    beforeEach(removeTempFile);
    afterEach(removeTempFile);

    it('should pipe the data', function(done){
      var stream = fs.createWriteStream('test/node/fixtures/tmp.json');

      var req = request.get('http://localhost:3025')
      .type('json');

      req.on('end', function() {
        JSON.parse(fs.readFileSync('test/node/fixtures/tmp.json', 'utf8')).should.eql({ name: 'tobi' });
        done();
      });
      req.pipe(stream);
    })

    function removeTempFile(done) {
      exec('rm test/node/fixtures/tmp.json || true', done);
    }
  });
});
