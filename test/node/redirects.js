'use strict';
const setup = require('../support/setup');

const base = setup.uri;

const assert = require('assert');
const request = require('../support/client');

describe('request', () => {
  describe('on redirect', () => {
    it('should merge cookies if agent is used', done => {
      request
        .agent()
        .get(`${base}/cookie-redirect`)
        .set('Cookie', 'orig=1; replaced=not')
        .end((err, res) => {
          try {
            assert.ifError(err);
            assert(/orig=1/.test(res.text), 'orig=1/.test');
            assert(/replaced=yes/.test(res.text), 'replaced=yes/.test');
            assert(/from-redir=1/.test(res.text), 'from-redir=1');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should not merge cookies if agent is not used', done => {
      request
        .get(`${base}/cookie-redirect`)
        .set('Cookie', 'orig=1; replaced=not')
        .end((err, res) => {
          try {
            assert.ifError(err);
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

    it('should have previously set cookie for subsquent requests when agent is used', done => {
      const agent = request.agent();
      agent.get(`${base}/set-cookie`).end(err => {
        assert.ifError(err);
        agent
          .get(`${base}/show-cookies`)
          .set({ Cookie: 'orig=1' })
          .end((err, res) => {
            try {
              assert.ifError(err);
              assert(/orig=1/.test(res.text), 'orig=1/.test');
              assert(/persist=123/.test(res.text), 'persist=123');
              done();
            } catch (err) {
              done(err);
            }
          });
      });
    });

    it('should follow Location', done => {
      const redirects = [];

      request
        .get(base)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            arr.push('/movies');
            arr.push('/movies/all');
            arr.push('/movies/all/0');
            redirects.should.eql(arr);
            res.text.should.equal('first movie page');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should not follow on HEAD by default', done => {
      const redirects = [];

      request
        .head(base)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            redirects.should.eql([]);
            res.status.should.equal(302);
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should follow on HEAD when redirects are set', done => {
      const redirects = [];

      request
        .head(base)
        .redirects(10)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            arr.push('/movies');
            arr.push('/movies/all');
            arr.push('/movies/all/0');
            redirects.should.eql(arr);
            assert(!res.text);
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should remove Content-* fields', done => {
      request
        .post(`${base}/header`)
        .type('txt')
        .set('X-Foo', 'bar')
        .set('X-Bar', 'baz')
        .send('hey')
        .end((err, res) => {
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

    it('should retain cookies', done => {
      request
        .get(`${base}/header`)
        .set('Cookie', 'foo=bar;')
        .end((err, res) => {
          try {
            assert(res.body);
            res.body.should.have.property('cookie', 'foo=bar;');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should not resend query parameters', done => {
      const redirects = [];
      const query = [];

      request
        .get(`${base}/?foo=bar`)
        .on('redirect', res => {
          query.push(res.headers.query);
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            arr.push('/movies');
            arr.push('/movies/all');
            arr.push('/movies/all/0');
            redirects.should.eql(arr);
            res.text.should.equal('first movie page');

            query.should.eql(['{"foo":"bar"}', '{}', '{}']);
            res.headers.query.should.eql('{}');
            done();
          } catch (err) {
            done(err);
          }
        });
    });

    it('should handle no location header', done => {
      request.get(`${base}/bad-redirect`).end((err, res) => {
        try {
          err.message.should.equal('No location header for redirect');
          done();
        } catch (err) {
          done(err);
        }
      });
    });

    describe('when relative', () => {
      it('should redirect to a sibling path', done => {
        const redirects = [];

        request
          .get(`${base}/relative`)
          .on('redirect', res => {
            redirects.push(res.headers.location);
          })
          .end((err, res) => {
            try {
              redirects.should.eql(['tobi']);
              res.text.should.equal('tobi');
              done();
            } catch (err) {
              done(err);
            }
          });
      });

      it('should redirect to a parent path', done => {
        const redirects = [];

        request
          .get(`${base}/relative/sub`)
          .on('redirect', res => {
            redirects.push(res.headers.location);
          })
          .end((err, res) => {
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
    it('should alter the default number of redirects to follow', done => {
      const redirects = [];

      request
        .get(base)
        .redirects(2)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            assert(res.redirect, 'res.redirect');
            arr.push('/movies');
            arr.push('/movies/all');
            redirects.should.eql(arr);
            res.text.should.match(/Moved Temporarily|Found/);
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  describe('on POST', () => {
    it('should redirect as GET', done => {
      const redirects = [];

      request
        .post(`${base}/movie`)
        .send({ name: 'Tobi' })
        .redirects(2)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            arr.push('/movies/all/0');
            redirects.should.eql(arr);
            res.text.should.equal('first movie page');
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });

  describe('on POST using multipart/form-data', () => {
    it('should redirect as GET', done => {
      const redirects = [];

      request
        .post(`${base}/movie`)
        .type('form')
        .field('name', 'Tobi')
        .redirects(2)
        .on('redirect', res => {
          redirects.push(res.headers.location);
        })
        .end((err, res) => {
          try {
            const arr = [];
            arr.push('/movies/all/0');
            redirects.should.eql(arr);
            res.text.should.equal('first movie page');
            done();
          } catch (err) {
            done(err);
          }
        });
    });
  });
});
