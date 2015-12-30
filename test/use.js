var setup = require('./support/setup');
var NODE = setup.NODE;
var uri = setup.uri;

var assert = require('assert');
var request = require('../');

describe('request', function(){
  this.timeout(10000);
  describe('use', function(){
    it('should use plugin success', function(done){
      var now = '' + Date.now();
      function uuid(req){
        req.set('X-UUID', now);
        return req;
      }
      function prefix(req){
        req.url = uri + req.url
        return req;
      }
      request
        .get('/echo')
        .use(uuid)
        .use(prefix)
        .end(function(err, res){
          assert(res.statusCode === 200);
          assert.equal(res.get('X-UUID'), now);
          done();
        })
    })
  })
})