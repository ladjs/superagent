const setup = require('./support/setup');

const base = setup.uri;
const isMSIE = !setup.NODE && /Trident\//.test(navigator.userAgent);

const assert = require('assert');
const request = require('./support/client');

describe('request', function () {
  this.timeout(20000);
  describe('on redirect', () => {
    it('should retain header fields', (done) => {
      request
        .get(`${base}/header`)
        .set('X-Foo', 'bar')
        .end((err, res) => {
          try {
            assert(res.body);
            res.body.should.have.property('x-foo', 'bar');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should preserve timeout across redirects', (done) => {
      request
        .get(`${base}/movies/random`)
        .timeout(250)
        .end((err, res) => {
          try {
            assert(err instanceof Error, 'expected an error');
            err.should.have.property('timeout', 250);
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should successfully redirect after retry on error', (done) => {
      const id = Math.random() * 1000000 * Date.now();
      request
        .get(`${base}/error/redirect/${id}`)
        .retry(2)
        .end((err, res) => {
          assert(res.ok, 'response should be ok');
          assert(res.text, 'first movie page');
          done();
        });
    });

    it('should preserve retries across redirects', (done) => {
      const id = Math.random() * 1000000 * Date.now();
      request
        .get(`${base}/error/redirect-error${id}`)
        .retry(2)
        .end((err, res) => {
          assert(err, 'expected an error');
          assert.equal(2, err.retries, 'expected an error with .retries');
          assert.equal(500, err.status, 'expected an error status of 500');
          done();
        });
    });
  });

  describe('on 303', () => {
    it('should redirect with same method', (done) => {
      request
        .put(`${base}/redirect-303`)
        .send({ msg: 'hello' })
        .redirects(1)
        .on('redirect', (res) => {
          res.headers.location.should.equal('/reply-method');
        })
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }

          res.text.should.equal('method=get');
          done();
        });
    });
  });

  describe('on 307', () => {
    it('should redirect with same method', (done) => {
      if (isMSIE) return done(); // IE9 broken

      request
        .put(`${base}/redirect-307`)
        .send({ msg: 'hello' })
        .redirects(1)
        .on('redirect', (res) => {
          res.headers.location.should.equal('/reply-method');
        })
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }

          res.text.should.equal('method=put');
          done();
        });
    });
  });

  describe('on 308', () => {
    it('should redirect with same method', (done) => {
      if (isMSIE) return done(); // IE9 broken

      request
        .put(`${base}/redirect-308`)
        .send({ msg: 'hello' })
        .redirects(1)
        .on('redirect', (res) => {
          res.headers.location.should.equal('/reply-method');
        })
        .end((err, res) => {
          if (err) {
            done(err);
            return;
          }

          res.text.should.equal('method=put');
          done();
        });
    });
  });
});
