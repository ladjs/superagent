
var request = require('../../')
  , express = require('express')
  , assert = require('better-assert')
  , app = express();

app.post('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/form-data', function(req, res){
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.send('pet[name]=manny');
});

var base = 'http://localhost'
var server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += ':' + server.address().port;
    done();
  });
});

describe('req.send(Object) as "form"', function(){
  describe('with req.type() set to form', function(){
    it('should send x-www-form-urlencoded data', function(done){
      request
      .post(base + '/echo')
      .type('form')
      .send({ name: 'tobi' })
      .end(function(err, res){
        res.header['content-type'].should.equal('application/x-www-form-urlencoded');
        res.text.should.equal('name=tobi');
        done();
      });
    })
  })

  describe('when called several times', function(){
    it('should merge the objects', function(done){
      request
      .post(base + '/echo')
      .type('form')
      .send({ name: { first: 'tobi', last: 'holowaychuk' } })
      .send({ age: '1' })
      .end(function(err, res){
        res.header['content-type'].should.equal('application/x-www-form-urlencoded');
        res.text.should.equal('name%5Bfirst%5D=tobi&name%5Blast%5D=holowaychuk&age=1');
        done();
      });
    })
  })
})

describe('req.send(String)', function(){
  it('should default to "form"', function(done){
    request
    .post(base + '/echo')
    .send('user[name]=tj')
    .send('user[email]=tj@vision-media.ca')
    .end(function(err, res){
      res.header['content-type'].should.equal('application/x-www-form-urlencoded');
      res.body.should.eql({ user: { name: 'tj', email: 'tj@vision-media.ca' } });
      done();
    })
  })
})

describe('res.body', function(){
  describe('application/x-www-form-urlencoded', function(){
    it('should parse the body', function(done){
      request
      .get(base + '/form-data')
      .end(function(err, res){
        res.text.should.equal('pet[name]=manny');
        res.body.should.eql({ pet: { name: 'manny' }});
        done();
      });
    })
  })
})
