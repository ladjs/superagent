const setup = require('./support/setup');

const base = setup.uri;
const assert = require('assert');
const request = require('./support/client');

function uniqid() {
  return Math.random() * 10000000;
}

describe('.retry(count)', function () {
  this.timeout(15000);

  it('should not retry if passed "0"', (done) => {
    request
      .get(`${base}/error`)
      .retry(0)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(
            undefined,
            err.retries,
            'expected an error without .retries'
          );
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should not retry if passed an invalid number', (done) => {
    request
      .get(`${base}/error`)
      .retry(-2)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(
            undefined,
            err.retries,
            'expected an error without .retries'
          );
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should not retry if passed undefined', (done) => {
    request
      .get(`${base}/error`)
      .retry(undefined)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(
            undefined,
            err.retries,
            'expected an error without .retries'
          );
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should handle server error after repeat attempt', (done) => {
    request
      .get(`${base}/error`)
      .retry(2)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(2, err.retries, 'expected an error with .retries');
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should retry if passed nothing', (done) => {
    request
      .get(`${base}/error`)
      .retry()
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(1, err.retries, 'expected an error with .retries');
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should retry if passed "true"', (done) => {
    request
      .get(`${base}/error`)
      .retry(true)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(1, err.retries, 'expected an error with .retries');
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should handle successful request after repeat attempt from server error', (done) => {
    request
      .get(`${base}/error/ok/${uniqid()}`)
      .query({ qs: 'present' })
      .retry(2)
      .end((err, res) => {
        try {
          assert.ifError(err);
          assert(res.ok, 'response should be ok');
          assert(res.text, 'res.text');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should handle server timeout error after repeat attempt', (done) => {
    request
      .get(`${base}/delay/400`)
      .timeout(200)
      .retry(2)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(2, err.retries, 'expected an error with .retries');
          assert.equal(
            'number',
            typeof err.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', err.code, 'expected abort error code');
          done();
        } catch (err_) {
          done(err_);
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
      .end((err, res) => {
        try {
          assert.ifError(err);
          assert(res.ok, 'response should be ok');
          assert.equal(res.text, `ok = ${url}&string=ified&json=ed`);
          done();
        } catch (err_) {
          done(err_);
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
      .then((res, err) => {
        try {
          assert.ifError(err);
          assert(res.ok, 'response should be ok');
          assert.equal(res.text, `ok = ${url}&string=ified&json=ed`);
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should correctly abort a retry attempt', (done) => {
    let aborted = false;
    const req = request.get(`${base}/delay/400`).timeout(200).retry(2);
    req.end((err, res) => {
      try {
        assert(false, 'should not complete the request');
      } catch (err_) {
        done(err_);
      }
    });

    req.on('abort', () => {
      aborted = true;
    });

    setTimeout(() => {
      req.abort();
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
      .end((err, res) => {
        try {
          assert.ifError(err);
          assert(res.body);
          res.body.should.have.property('x-foo', 'bar');
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });

  it('should not retry on 4xx responses', (done) => {
    request
      .get(`${base}/bad-request`)
      .retry(2)
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(0, err.retries, 'expected an error with 0 .retries');
          assert.equal(400, err.status, 'expected an error status of 400');
          done();
        } catch (err_) {
          done(err_);
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
      .end((err, res) => {
        try {
          assert(err, 'expected an error');
          assert.equal(2, err.retries, 'expected an error with .retries');
          assert.equal(500, err.status, 'expected an error status of 500');
          assert.equal(
            2,
            callbackCallCount,
            'expected the callback to be called on each retry'
          );
          done();
        } catch (err_) {
          done(err_);
        }
      });
  });
});
