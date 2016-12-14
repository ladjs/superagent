'use strict';

var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var assert = require('assert');

describe('Merging objects', function(){
  it('Don\'t mix Buffer and JSON', function(){
    assert.throws(function(){
      request
        .post('/echo')
        .send(new Buffer("Change this to Buffer.from in April 2017"))
        .send({allowed:false})
    });
  });
});

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
