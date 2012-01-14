
var utils = require('../../lib/node/utils');

describe('utils.type(obj)', function(){
  it('should return the mime type', function(){
    var res = { headers: { 'content-type': 'application/json; charset=utf-8' }};
    utils.type(res).should.equal('application/json');
  })
})