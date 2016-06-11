var request = require('../../')
  , express = require('express')
  , app = express()
  , fs = require('fs')
  , bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/', function(req, res){
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
});

app.post('/', function(req, res){
  res.send(req.body);
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('request pipe', function(){
  var destPath = 'test/node/fixtures/tmp.json';

  after(function removeTmpfile(done){
    fs.unlink(destPath, done);
  });

  it('should act as a writable stream', function(done){
    var req = request.post(base);
    var stream = fs.createReadStream('test/node/fixtures/user.json');

    req.type('json');

    req.on('response', function(res){
      res.body.should.eql({ name: 'tobi' });
      done();
    });

    stream.pipe(req);
  })

  it('should act as a readable stream', function(done){
    var stream = fs.createWriteStream(destPath);

    var responseCalled = false;
    var req = request.get(base);
    req.type('json');

    req.on('response', function(res){
      res.should.have.status(200);
      responseCalled = true;
    });
    stream.on('finish', function(){
      JSON.parse(fs.readFileSync(destPath, 'utf8')).should.eql({ name: 'tobi' });
      responseCalled.should.be.true();
      done();
    });
    req.pipe(stream);
  })
});
