const assert = require('assert');
const getSetup = require('./support/setup');

const request = require('./support/client');

describe('request', function () {
  let setup;
  let uri;

  before(async function () {
    setup = await getSetup();
    uri = setup.uri;
  });

  this.timeout(20_000);
  describe('use', () => {
    it('should use plugin success', (done) => {
      const now = `${Date.now()}`;
      function uuid(request_) {
        request_.set('X-UUID', now);
        return request_;
      }

      function prefix(request_) {
        request_.url = uri + request_.url;
        return request_;
      }

      request
        .get('/echo')
        .use(uuid)
        .use(prefix)
        .end((error, res) => {
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
    const request_ = request.get('/');
    assert(request_ instanceof request.Request);
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

    const request_ = request.get('/').send();
    assert(constructorCalled);
    assert(sendCalled);
    assert(request_ instanceof NewRequest);
    assert(request_ instanceof OriginalRequest);
  });

  it('should use patched subclass in agent too', () => {
    if (!request.agent) return; // Node-only

    function NewRequest(...args) {
      OriginalRequest.apply(this, args);
    }

    NewRequest.prototype = Object.create(OriginalRequest.prototype);
    request.Request = NewRequest;

    const request_ = request.agent().del('/');
    assert(request_ instanceof NewRequest);
    assert(request_ instanceof OriginalRequest);
  });
});
