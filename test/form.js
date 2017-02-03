var setup = require('./support/setup');
var base = setup.uri;
var should = require('should');
var request = require('../');

var assert = require('assert');
if (!assert.deepStrictEqual) assert.deepStrictEqual = assert.deepEqual;

var formDataSupported = setup.NODE || 'undefined' !== FormData;

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

describe('req.attach', function(){
  it('ignores null file', function(done){
    request
      .post('/echo')
      .attach('image', null)
      .end(function(err, res){
        done();
      });
  });
});

describe('req.field', function(){
  it('allow bools', function(done){
    if (!formDataSupported) {
      return done();
    }

    request
      .post(base + '/formecho')
      .field('bools', true)
      .field('strings', 'true')
      .end(function(err, res){
        assert.ifError(err);
        assert.deepStrictEqual(res.body, {bools:'true', strings:'true'});
        done();
      });
  });

  it('allow objects', function(done){
    if (!formDataSupported) {
      return done();
    }

    request
      .post(base + '/formecho')
      .field({bools: true, strings: 'true'})
      .end(function(err, res){
        assert.ifError(err);
        assert.deepStrictEqual(res.body, {bools:'true', strings:'true'});
        done();
      });
  });

  it('works with arrays in objects', function(done){
    if (!formDataSupported) {
      return done();
    }

    request
      .post(base + '/formecho')
      .field({numbers: [1,2,3]})
      .end(function(err, res){
        assert.ifError(err);
        assert.deepStrictEqual(res.body, {numbers:['1','2','3']});
        done();
      });
  });

  it('works with arrays', function(done){
    if (!formDataSupported) {
      return done();
    }

    request
      .post(base + '/formecho')
      .field('letters', ['a', 'b', 'c'])
      .end(function(err, res){
        assert.ifError(err);
        assert.deepStrictEqual(res.body, {letters: ['a', 'b', 'c']});
        done();
      });
  });

  it('throw when empty', function(){
    should.throws(function(){
      request
      .post(base + '/echo')
      .field()
    }, /name/);

    should.throws(function(){
      request
      .post(base + '/echo')
      .field('name')
    }, /val/);
  });
});
