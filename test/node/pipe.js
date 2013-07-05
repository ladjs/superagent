
var request = require('../../')
  , express = require('express')
  , app = express()
  , fs = require('fs');

app.use(express.bodyParser());

app.post('/', function(req, res){
  res.send(req.body);
});

app.listen(3020);

describe('request pipe', function(){
  afterEach(removeTmpfile);

  it('should act as a writable stream', function(done){
    var req = request.post('http://localhost:3020');
    var stream = fs.createReadStream('test/node/fixtures/user.json');

    req.type('json');

    req.on('response', function(res){
      res.body.should.eql({ name: 'tobi' });
      done();
    });

    stream.pipe(req);
  })

  it('should act as a readable stream', function(done){
    var stream = fs.createWriteStream('test/node/fixtures/tmp.json');

    var req = request.get('http://localhost:3025');
    req.type('json');

    req.on('end', function(){
      JSON.parse(fs.readFileSync('test/node/fixtures/tmp.json', 'utf8')).should.eql({ name: 'tobi' });
      done();
    });
    req.pipe(stream);
  })
});

function removeTmpfile(done){
  fs.unlink('test/node/fixtures/tmp.json', function(err){
    done();
  });
}
