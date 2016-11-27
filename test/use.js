var setup = require('./support/setup');
var uri = setup.uri;

var assert = require('assert');
var request = require('../');

describe('request', function(){
  this.timeout(20000);
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
          assert.strictEqual(res.statusCode, 200);
          assert.equal(res.get('X-UUID'), now);
          done();
        })
    });
  });
})

describe('subclass', function() {
  var OriginalRequest;
  beforeEach(function(){
    OriginalRequest = request.Request;
  });
  afterEach(function(){
    request.Request = OriginalRequest;
  });

  it('should be an instance of Request', function(){
    var req = request.get('/');
    assert(req instanceof request.Request);
  });

  it('should use patched subclass', function(){
    assert(OriginalRequest);

    var constructorCalled, sendCalled;
    function NewRequest() {
      constructorCalled = true;
      OriginalRequest.apply(this, arguments);
    }
    NewRequest.prototype = Object.create(OriginalRequest.prototype);
    NewRequest.prototype.send = function() {
      sendCalled = true;
      return this;
    };

    request.Request = NewRequest;

    var req = request.get('/').send();
    assert(constructorCalled);
    assert(sendCalled);
    assert(req instanceof NewRequest);
    assert(req instanceof OriginalRequest);
  });

  it('should use patched subclass in agent too', function(){
    if (!request.agent) return; // Node-only

    function NewRequest() {
      OriginalRequest.apply(this, arguments);
    }
    NewRequest.prototype = Object.create(OriginalRequest.prototype);
    request.Request = NewRequest;

    var req = request.agent().del('/');
    assert(req instanceof NewRequest);
    assert(req instanceof OriginalRequest);
  });
})
