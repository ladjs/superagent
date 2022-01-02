const setup = require('./support/setup');

const base = setup.uri;
const assert = require('assert');
const request = require('./support/client');

describe('.timeout(ms)', function () {
  this.timeout(15_000);

  describe('when timeout is exceeded', () => {
    it('should error', (done) => {
      request
        .get(`${base}/delay/500`)
        .timeout(150)
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          done();
        });
    });

    it('should error in promise interface ', (done) => {
      request
        .get(`${base}/delay/500`)
        .timeout(150)
        .catch((err) => {
          assert(err, 'expected an error');
          assert.equal(
            'number',
            typeof err.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', err.code, 'expected abort error code');
          done();
        });
    });

    it('should handle gzip timeout', (done) => {
      request
        .get(`${base}/delay/zip`)
        .timeout(150)
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          done();
        });
    });

    it('should handle buffer timeout', (done) => {
      request
        .get(`${base}/delay/json`)
        .buffer(true)
        .timeout(150)
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          done();
        });
    });

    it('should error on deadline', (done) => {
      request
        .get(`${base}/delay/500`)
        .timeout({ deadline: 150 })
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          done();
        });
    });

    it('should support setting individual options', (done) => {
      request
        .get(`${base}/delay/500`)
        .timeout({ deadline: 10 })
        .timeout({ response: 99_999 })
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          assert.equal('ETIME', error.errno);
          done();
        });
    });

    it('should error on response', (done) => {
      request
        .get(`${base}/delay/500`)
        .timeout({ response: 150 })
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(
            'number',
            typeof error.timeout,
            'expected an error with .timeout'
          );
          assert.equal('ECONNABORTED', error.code, 'expected abort error code');
          assert.equal('ETIMEDOUT', error.errno);
          done();
        });
    });

    it('should accept slow body with fast response', (done) => {
      request
        .get(`${base}/delay/slowbody`)
        .timeout({ response: 1000 })
        .on('progress', () => {
          // This only makes the test faster without relying on arbitrary timeouts
          request.get(`${base}/delay/slowbody/finish`).end();
        })
        .end(done);
    });
  });
});
