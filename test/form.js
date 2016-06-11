var setup = require('./support/setup');
var base = setup.uri;

var request = require('../');

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
