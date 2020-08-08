const setup = require('./support/setup');

const { uri } = setup;

const assert = require('assert');
const request = require('./support/client');

describe('request', function () {
  this.timeout(20000);
  describe('use', () => {
    it('should use plugin success', (done) => {
      const now = `${Date.now()}`;
      function uuid(req) {
        req.set('X-UUID', now);
        return req;
      }

      function prefix(req) {
        req.url = uri + req.url;
        return req;
      }

      request
        .get('/echo')
        .use(uuid)
        .use(prefix)
        .end((err, res) => {
          assert.strictEqual(res.statusCode, 200);
          assert.equal(res.get('X-UUID'), now);
          done();
        });
    });
  });
});

describe('subclass', () => {
  let OriginalRequest;
  beforeEach(() => {
    OriginalRequest = request.Request;
  });
  afterEach(() => {
    request.Request = OriginalRequest;
  });

  it('should be an instance of Request', () => {
    const req = request.get('/');
    assert(req instanceof request.Request);
  });

  it('should use patched subclass', () => {
    assert(OriginalRequest);

    let constructorCalled;
    let sendCalled;
    function NewRequest(...args) {
      constructorCalled = true;
      OriginalRequest.apply(this, args);
    }

    NewRequest.prototype = Object.create(OriginalRequest.prototype);
    NewRequest.prototype.send = function () {
      sendCalled = true;
      return this;
    };

    request.Request = NewRequest;

    const req = request.get('/').send();
    assert(constructorCalled);
    assert(sendCalled);
    assert(req instanceof NewRequest);
    assert(req instanceof OriginalRequest);
  });

  it('should use patched subclass in agent too', () => {
    if (!request.agent) return; // Node-only

    function NewRequest(...args) {
      OriginalRequest.apply(this, args);
    }

    NewRequest.prototype = Object.create(OriginalRequest.prototype);
    request.Request = NewRequest;

    const req = request.agent().del('/');
    assert(req instanceof NewRequest);
    assert(req instanceof OriginalRequest);
  });
});
