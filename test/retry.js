const assert = require('assert');
const getSetup = require('./support/setup');

const request = require('./support/client');

function uniqid() {
  return Math.random() * 10_000_000;
}

describe('.retry(count)', function () {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  this.timeout(15_000);

  it('should not retry if passed "0"', (done) => {
    request
      .get(`${base}/error`)
      .retry(0)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(
            undefined,
            error.retries,
            'expected an error without .retries'
          );
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should not retry if passed an invalid number', (done) => {
    request
      .get(`${base}/error`)
      .retry(-2)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(
            undefined,
            error.retries,
            'expected an error without .retries'
          );
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should not retry if passed undefined', (done) => {
    request
      .get(`${base}/error`)
      .retry(undefined)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(
            undefined,
            error.retries,
            'expected an error without .retries'
          );
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should handle server error after repeat attempt', (done) => {
    request
      .get(`${base}/error`)
      .retry(2)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(2, error.retries, 'expected an error with .retries');
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should retry if passed nothing', (done) => {
    request
      .get(`${base}/error`)
      .retry()
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(1, error.retries, 'expected an error with .retries');
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should retry if passed "true"', (done) => {
    request
      .get(`${base}/error`)
      .retry(true)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(1, error.retries, 'expected an error with .retries');
          assert.equal(500, error.status, 'expected an error status of 500');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should handle successful request after repeat attempt from server error', (done) => {
    request
      .get(`${base}/error/ok/${uniqid()}`)
      .query({ qs: 'present' })
      .retry(2)
      .end((error, res) => {
        try {
          assert.ifError(error);
          assert(res.ok, 'response should be ok');
          assert(res.text, 'res.text');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should handle server timeout error after repeat attempt', (done) => {
    request
      .get(`${base}/delay/400`)
      .timeout(200)
      .retry(2)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(2, error.retries, 'expected an error with .retries');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should handle successful request after repeat attempt from server timeout', (done) => {
    const url = `/delay/1200/ok/${uniqid()}?built=in`;
    request
      .get(base + url)
      .query('string=ified')
      .query({ json: 'ed' })
      .timeout(600)
      .retry(2)
      .end((error, res) => {
        try {
          assert.ifError(error);
          assert(res.ok, 'response should be ok');
          assert.equal(res.text, `ok = ${url}&string=ified&json=ed`);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should handle successful request after repeat attempt from server timeout when using .then(fulfill, reject)', (done) => {
    const url = `/delay/1200/ok/${uniqid()}?built=in`;
    request
      .get(base + url)
      .query('string=ified')
      .query({ json: 'ed' })
      .timeout(600)
      .retry(1)
      .then((res, error) => {
        try {
          assert.ifError(error);
          assert(res.ok, 'response should be ok');
          assert.equal(res.text, `ok = ${url}&string=ified&json=ed`);
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should correctly abort a retry attempt', (done) => {
    let aborted = false;
    const request_ = request.get(`${base}/delay/400`).timeout(200).retry(2);
    request_.end((error, res) => {
      try {
        assert(false, 'should not complete the request');
      } catch (error_) {
        done(error_);
      }
    });

    request_.on('abort', () => {
      aborted = true;
    });

    setTimeout(() => {
      request_.abort();
      setTimeout(() => {
        try {
          assert(aborted, 'should be aborted');
          done();
        } catch (err) {
          done(err);
        }
      }, 150);
    }, 150);
  });

  it('should correctly retain header fields', (done) => {
    request
      .get(`${base}/error/ok/${uniqid()}`)
      .query({ qs: 'present' })
      .retry(2)
      .set('X-Foo', 'bar')
      .end((error, res) => {
        try {
          assert.ifError(error);
          assert(res.body);
          res.body.should.have.property('x-foo', 'bar');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should not retry on 4xx responses', (done) => {
    request
      .get(`${base}/bad-request`)
      .retry(2)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(0, error.retries, 'expected an error with 0 .retries');
          assert.equal(400, error.status, 'expected an error status of 400');
          done();
        } catch (err) {
          done(err);
        }
      });
  });

  it('should execute callback on retry if passed', (done) => {
    let callbackCallCount = 0;
    function retryCallback(request) {
      callbackCallCount++;
    }

    request
      .get(`${base}/error`)
      .retry(2, retryCallback)
      .end((error, res) => {
        try {
          assert(error, 'expected an error');
          assert.equal(2, error.retries, 'expected an error with .retries');
          assert.equal(500, error.status, 'expected an error status of 500');
          assert.equal(
            2,
            callbackCallCount,
            'expected the callback to be called on each retry'
          );
          done();
        } catch (err) {
          done(err);
        }
      });
  });
});
