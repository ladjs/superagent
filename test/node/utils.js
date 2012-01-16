
var utils = require('../../lib/node/utils')
  , assert = require('assert');

describe('utils.uid(len)', function(){
  it('should generate a unique id', function(){
    utils.uid(10).should.have.length(10);
    utils.uid(30).should.have.length(30);
    utils.uid(30).should.not.equal(utils.uid(30));
  })
})

describe('utils.type(str)', function(){
  it('should return the mime type', function(){
    utils.type('application/json; charset=utf-8')
      .should.equal('application/json');

    utils.type('application/json')
      .should.equal('application/json');
  })
})

describe('utils.params(str)', function(){
  it('should return the field parameters', function(){
    var str = 'application/json; charset=utf-8; foo  = bar';
    var obj = utils.params(str);
    obj.charset.should.equal('utf-8');
    obj.foo.should.equal('bar');

    var str = 'application/json';
    utils.params(str).should.eql({});
  })
})
