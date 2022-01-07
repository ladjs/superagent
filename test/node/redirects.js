'use strict';

const URL = require('url');
const assert = require('assert');
const getSetup = require('../support/setup');
const request = require('../support/client');

describe('request', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('on redirect', () => {
    it('should merge cookies if agent is used', (done) => {
      request
        .agent()
        .get(`${base}/cookie-redirect`)
        .set('Cookie', 'orig=1; replaced=not')
        .end((error, res) => {
          try {
            assert.ifError(error);
            assert(/orig=1/.test(res.text), 'orig=1/.test');
            assert(/replaced=yes/.test(res.text), 'replaced=yes/.test');
            assert(/from-redir=1/.test(res.text), 'from-redir=1');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should not merge cookies if agent is not used', (done) => {
      request
        .get(`${base}/cookie-redirect`)
        .set('Cookie', 'orig=1; replaced=not')
        .end((error, res) => {
          try {
            assert.ifError(error);
            assert(/orig=1/.test(res.text), '/orig=1');
            assert(/replaced=not/.test(res.text), '/replaced=not');
            assert(!/replaced=yes/.test(res.text), '!/replaced=yes');
            assert(!/from-redir/.test(res.text), '!/from-redir');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should have previously set cookie for subsquent requests when agent is used', (done) => {
      const agent = request.agent();
      agent.get(`${base}/set-cookie`).end((error) => {
        assert.ifError(error);
        agent
          .get(`${base}/show-cookies`)
          .set({ Cookie: 'orig=1' })
          .end((error, res) => {
            try {
              assert.ifError(error);
              assert(/orig=1/.test(res.text), 'orig=1/.test');
              assert(/persist=123/.test(res.text), 'persist=123');
              done();
            } catch (err) {
              done(err);
            }
          });
      });
    });

    it('should follow Location', (done) => {
      const redirects = [];

      request
        .get(base)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .end((error, res) => {
          try {
            const array = ['/movies', '/movies/all', '/movies/all/0'];
            redirects.should.eql(array);
            res.text.should.equal('first movie page');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should follow Location with IP override', () => {
      const redirects = [];
      const url = URL.parse(base);
      return request
        .get(`http://redir.example.com:${url.port || '80'}${url.pathname}`)
        .connect({
          '*': url.hostname
        })
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .then((res) => {
          const array = ['/movies', '/movies/all', '/movies/all/0'];
          redirects.should.eql(array);
          res.text.should.equal('first movie page');
        });
    });

    it('should follow Location with IP:port override', () => {
      const redirects = [];
      const url = URL.parse(base);
      return request
        .get(`http://redir.example.com:9999${url.pathname}`)
        .connect({
          '*': { host: url.hostname, port: url.port || 80 }
        })
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .then((res) => {
          const array = ['/movies', '/movies/all', '/movies/all/0'];
          redirects.should.eql(array);
          res.text.should.equal('first movie page');
        });
    });

    it('should not follow on HEAD by default', () => {
      const redirects = [];

      return request
        .head(base)
        .ok(() => true)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .then((res) => {
          redirects.should.eql([]);
          res.status.should.equal(302);
        });
    });

    it('should follow on HEAD when redirects are set', (done) => {
      const redirects = [];

      request
        .head(base)
        .redirects(10)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .end((error, res) => {
          try {
            const array = [];
            array.push('/movies', '/movies/all', '/movies/all/0');
            redirects.should.eql(array);
            assert(!res.text);
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should remove Content-* fields', (done) => {
      request
        .post(`${base}/header`)
        .type('txt')
        .set('X-Foo', 'bar')
        .set('X-Bar', 'baz')
        .send('hey')
        .end((error, res) => {
          try {
            assert(res.body);
            res.body.should.have.property('x-foo', 'bar');
            res.body.should.have.property('x-bar', 'baz');
            res.body.should.not.have.property('content-type');
            res.body.should.not.have.property('content-length');
            res.body.should.not.have.property('transfer-encoding');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should retain cookies', (done) => {
      request
        .get(`${base}/header`)
        .set('Cookie', 'foo=bar;')
        .end((error, res) => {
          try {
            assert(res.body);
            res.body.should.have.property('cookie', 'foo=bar;');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should not resend query parameters', (done) => {
      const redirects = [];
      const query = [];

      request
        .get(`${base}/?foo=bar`)
        .on('redirect', (res) => {
          query.push(res.headers.query);
          redirects.push(res.headers.location);
        })
        .end((error, res) => {
          try {
            const array = [];
            array.push('/movies', '/movies/all', '/movies/all/0');
            redirects.should.eql(array);
            res.text.should.equal('first movie page');

            query.should.eql(['{"foo":"bar"}', '{}', '{}']);
            res.headers.query.should.eql('{}');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should handle no location header', (done) => {
      request.get(`${base}/bad-redirect`).end((error, res) => {
        try {
          error.message.should.equal('No location header for redirect');
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    describe('when relative', () => {
      it('should redirect to a sibling path', (done) => {
        const redirects = [];

        request
          .get(`${base}/relative`)
          .on('redirect', (res) => {
            redirects.push(res.headers.location);
          })
          .end((error, res) => {
            try {
              redirects.should.eql(['tobi']);
              res.text.should.equal('tobi');
              done();
            } catch (err) {
              done(err);
            }
          });
      });

      it('should redirect to a parent path', (done) => {
        const redirects = [];

        request
          .get(`${base}/relative/sub`)
          .on('redirect', (res) => {
            redirects.push(res.headers.location);
          })
          .end((error, res) => {
            try {
              redirects.should.eql(['../tobi']);
              res.text.should.equal('tobi');
              done();
            } catch (err) {
              done(err);
            }
          });
      });
    });
  });

  describe('req.redirects(n)', () => {
    it('should alter the default number of redirects to follow', (done) => {
      const redirects = [];

      request
        .get(base)
        .redirects(2)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .end((error, res) => {
          try {
            const array = [];
            assert(res.redirect, 'res.redirect');
            array.push('/movies', '/movies/all');
            redirects.should.eql(array);
            res.text.should.match(/Moved Temporarily|Found/);
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  describe('on POST', () => {
    it('should redirect as GET', () => {
      const redirects = [];

      return request
        .post(`${base}/movie`)
        .send({ name: 'Tobi' })
        .redirects(2)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .then((res) => {
          redirects.should.eql(['/movies/all/0']);
          res.text.should.equal('first movie page');
        });
    });

    it('using multipart/form-data should redirect as GET', () => {
      const redirects = [];

      request
        .post(`${base}/movie`)
        .type('form')
        .field('name', 'Tobi')
        .redirects(2)
        .on('redirect', (res) => {
          redirects.push(res.headers.location);
        })
        .then((res) => {
          redirects.should.eql(['/movies/all/0']);
          res.text.should.equal('first movie page');
        });
    });
  });
});
