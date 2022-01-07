const assert = require('assert');

const getSetup = require('./support/setup');
const request = require('./support/client');

describe('request', function () {
  let setup;
  let base;
  let isMSIE;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
    isMSIE = !setup.NODE && /Trident\//.test(navigator.userAgent);
  });

  this.timeout(20_000);
  describe('on redirect', () => {
    it('should retain header fields', (done) => {
      request
        .get(`${base}/header`)
        .set('X-Foo', 'bar')
        .end((error, res) => {
          try {
            assert(res.body);
            res.body.should.have.property('x-foo', 'bar');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should preserve timeout across redirects', (done) => {
      request
        .get(`${base}/movies/random`)
        .timeout(250)
        .end((error, res) => {
          try {
            assert(error instanceof Error, 'expected an error');
            error.should.have.property('timeout', 250);
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should successfully redirect after retry on error', (done) => {
      const id = Math.random() * 1_000_000 * Date.now();
      request
        .get(`${base}/error/redirect/${id}`)
        .retry(2)
        .end((error, res) => {
          assert(res.ok, 'response should be ok');
          assert(res.text, 'first movie page');
          done();
        });
    });

    it('should preserve retries across redirects', (done) => {
      const id = Math.random() * 1_000_000 * Date.now();
      request
        .get(`${base}/error/redirect-error${id}`)
        .retry(2)
        .end((error, res) => {
          assert(error, 'expected an error');
          assert.equal(2, error.retries, 'expected an error with .retries');
          assert.equal(500, error.status, 'expected an error status of 500');
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
        .end((error, res) => {
          if (error) {
            done(error);
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
        .end((error, res) => {
          if (error) {
            done(error);
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
        .end((error, res) => {
          if (error) {
            done(error);
            return;
          }

          res.text.should.equal('method=put');
          done();
        });
    });
  });
});
