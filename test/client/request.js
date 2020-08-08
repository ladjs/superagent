const assert = require('assert');
const request = require('../support/client');

describe('request', function () {
  this.timeout(20000);

  it('request() error object', (next) => {
    request('GET', '/error').end((err, res) => {
      assert(err);
      assert(res.error, 'response should be an error');
      assert.equal(res.error.message, 'cannot GET /error (500)');
      assert.equal(res.error.status, 500);
      assert.equal(res.error.method, 'GET');
      assert.equal(res.error.url, '/error');
      next();
    });
  });

  // This test results in a weird Jetty error on IE9 and IE11 saying PATCH is not a supported method. Looks like something's up with SauceLabs
  const isIE11 = Boolean(navigator.userAgent.match(/Trident.*rv[ :]*11\./));
  const isIE9OrOlder = !window.atob;
  if (!isIE9OrOlder && !isIE11) {
    // Don't run on IE9 or older, or IE11
    it('patch()', (next) => {
      request.patch('/user/12').end((err, res) => {
        assert.equal('updated', res.text);
        next();
      });
    });
  }

  it('POST native FormData', (next) => {
    if (!window.FormData) {
      // Skip test if FormData is not supported by browser
      return next();
    }

    const data = new FormData();
    data.append('foo', 'bar');

    request
      .post('/echo')
      .send(data)
      .end((err, res) => {
        assert.equal('multipart/form-data', res.type);
        next();
      });
  });

  it('defaults attached files to original file names', (next) => {
    if (!window.FormData) {
      // Skip test if FormData is are not supported by browser
      return next();
    }

    try {
      var file = new File([''], 'image.jpg', { type: 'image/jpeg' });
      // eslint-disable-next-line unicorn/prefer-optional-catch-binding
    } catch (err) {
      // Skip if file constructor not supported.
      return next();
    }

    request
      .post('/echo')
      .attach('image', file)
      .end((err, res) => {
        const regx = new RegExp(`filename="${file.name}"`);
        assert.notEqual(res.text.match(regx), null);
        next();
      });
  });

  it('attach() cannot be mixed with send()', () => {
    if (!window.FormData || !window.File) {
      // Skip test if FormData is are not supported by browser
      return;
    }

    assert.throws(() => {
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
      request.post('/echo').attach('image', file).send('hi');
    });

    assert.throws(() => {
      const file = new File([''], 'image.jpg', { type: 'image/jpeg' });
      request.post('/echo').send('hi').attach('image', file);
    });
  });

  it('GET invalid json', (next) => {
    request.get('/invalid-json').end((err, res) => {
      assert(err.parse);
      assert.deepEqual(
        err.rawResponse,
        ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
      );
      next();
    });
  });

  it('GET querystring empty objects', (next) => {
    const req = request.get('/querystring').query({});
    req.end((err, res) => {
      assert.deepEqual(req._query, []);
      assert.deepEqual(res.body, {});
      next();
    });
  });

  it('GET querystring object .get(uri, obj)', (next) => {
    request.get('/querystring', { search: 'Manny' }).end((err, res) => {
      assert.deepEqual(res.body, { search: 'Manny' });
      next();
    });
  });

  it('GET querystring object .get(uri, obj, fn)', (next) => {
    request.get('/querystring', { search: 'Manny' }, (err, res) => {
      assert.deepEqual(res.body, { search: 'Manny' });
      next();
    });
  });

  it('GET querystring object with null value', (next) => {
    request.get('/url', { nil: null }).end((err, res) => {
      assert.equal(res.text, '/url?nil');
      next();
    });
  });

  it('GET blob object', (next) => {
    if (typeof Blob === 'undefined') {
      return next();
    }

    request
      .get('/blob', { foo: 'bar' })
      .responseType('blob')
      .end((err, res) => {
        assert(res.xhr.response instanceof Blob);
        assert(res.body instanceof Blob);
        next();
      });
  });

  it('Reject node-only function', () => {
    assert.throws(() => {
      request.get().write();
    });
    assert.throws(() => {
      request.get().pipe();
    });
  });

  window.btoa = window.btoa || null;
  it('basic auth', (next) => {
    window.btoa = window.btoa || require('Base64').btoa;

    request
      .post('/auth')
      .auth('foo', 'bar')
      .end((err, res) => {
        assert.equal('foo', res.body.user);
        assert.equal('bar', res.body.pass);
        next();
      });
  });

  it('auth type "basic"', (next) => {
    window.btoa = window.btoa || require('Base64').btoa;

    request
      .post('/auth')
      .auth('foo', 'bar', { type: 'basic' })
      .end((err, res) => {
        assert.equal('foo', res.body.user);
        assert.equal('bar', res.body.pass);
        next();
      });
  });

  it('auth type "auto"', (next) => {
    window.btoa = window.btoa || require('Base64').btoa;

    request
      .post('/auth')
      .auth('foo', 'bar', { type: 'auto' })
      .end((err, res) => {
        assert.equal('foo', res.body.user);
        assert.equal('bar', res.body.pass);
        next();
      });
  });

  it('progress event listener on xhr object registered when some on the request', () => {
    const req = request.get('/foo').on('progress', (data) => {});
    req.end();

    if (req.xhr.upload) {
      // Only run assertion on capable browsers
      assert.notEqual(null, req.xhr.upload.onprogress);
    }
  });

  it('no progress event listener on xhr object when none registered on request', () => {
    const req = request.get('/foo');
    req.end();

    if (req.xhr.upload) {
      // Only run assertion on capable browsers
      assert.strictEqual(null, req.xhr.upload.onprogress);
    }
  });

  it('Request#parse overrides body parser no matter Content-Type', (done) => {
    let runParser = false;

    function testParser(data) {
      runParser = true;
      return JSON.stringify(data);
    }

    request
      .post('/user')
      .serialize(testParser)
      .type('json')
      .send({ foo: 123 })
      .end((err) => {
        if (err) return done(err);
        assert(runParser);
        done();
      });
  });

  // Don't run on browsers without xhr2 support
  if ('FormData' in window) {
    it('xhr2 download file old hack', (next) => {
      request.parse['application/vnd.superagent'] = (obj) => obj;

      request
        .get('/arraybuffer')
        .on('request', function () {
          this.xhr.responseType = 'arraybuffer';
        })
        .on('response', (res) => {
          assert(res.body instanceof ArrayBuffer);
          next();
        })
        .end();
    });

    it('xhr2 download file responseType', (next) => {
      request.parse['application/vnd.superagent'] = (obj) => obj;

      request
        .get('/arraybuffer')
        .responseType('arraybuffer')
        .on('response', (res) => {
          assert(res.body instanceof ArrayBuffer);
          next();
        })
        .end();
    });

    it('get error status code and rawResponse on file download', (next) => {
      request
        .get('/arraybuffer-unauthorized')
        .responseType('arraybuffer')
        .end((err, res) => {
          assert.equal(err.status, 401);
          assert(res.body instanceof ArrayBuffer);
          assert(err.response.body instanceof ArrayBuffer);
          const decodedString = String.fromCharCode.apply(
            null,
            new Uint8Array(res.body)
          );
          assert(
            decodedString,
            '{"message":"Authorization has been denied for this request."}'
          );
          next();
        });
    });
  }

  it('parse should take precedence over default parse', (done) => {
    request
      .get('/foo')
      .parse((res, text) => `customText: ${res.status}`)
      .end((err, res) => {
        assert(res.ok);
        assert(res.body === 'customText: 200');
        done();
      });
  });

  it('handles `xhr.open()` errors', (done) => {
    request
      .get('http://foo\0.com') // throws "Failed to execute 'open' on 'XMLHttpRequest': Invalid URL"
      .end((err, res) => {
        assert(err);
        done();
      });
  });
});
