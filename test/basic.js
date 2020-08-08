const setup = require('./support/setup');

const { NODE } = setup;
const { uri } = setup;

const assert = require('assert');
const request = require('./support/client');

describe('request', function () {
  this.timeout(20000);

  describe('res.statusCode', () => {
    it('should set statusCode', (done) => {
      request.get(`${uri}/login`, (err, res) => {
        try {
          assert.strictEqual(res.statusCode, 200);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('should allow the send shorthand', () => {
    it('with callback in the method call', (done) => {
      request.get(`${uri}/login`, (err, res) => {
        assert.equal(res.status, 200);
        done();
      });
    });

    it('with data in the method call', (done) => {
      request.post(`${uri}/echo`, { foo: 'bar' }).end((err, res) => {
        assert.equal('{"foo":"bar"}', res.text);
        done();
      });
    });

    it('with callback and data in the method call', (done) => {
      request.post(`${uri}/echo`, { foo: 'bar' }, (err, res) => {
        assert.equal('{"foo":"bar"}', res.text);
        done();
      });
    });
  });

  describe('with a callback', () => {
    it('should invoke .end()', (done) => {
      request.get(`${uri}/login`, (err, res) => {
        try {
          assert.equal(res.status, 200);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('.end()', () => {
    it('should issue a request', (done) => {
      request.get(`${uri}/login`).end((err, res) => {
        try {
          assert.equal(res.status, 200);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });

    it('is optional with a promise', () => {
      if (typeof Promise === 'undefined') {
        return;
      }

      return request
        .get(`${uri}/login`)
        .then((res) => res.status)
        .then()
        .then((status) => {
          assert.equal(200, status, 'Real promises pass results through');
        });
    });

    it('called only once with a promise', () => {
      if (typeof Promise === 'undefined') {
        return;
      }

      const req = request.get(`${uri}/unique`);

      return Promise.all([req, req, req]).then((results) => {
        results.forEach((item) => {
          assert.equal(
            item.body,
            results[0].body,
            'It should keep returning the same result after being called once'
          );
        });
      });
    });
  });

  describe('res.error', () => {
    it('ok', (done) => {
      let calledErrorEvent = false;
      let calledOKHandler = false;
      request
        .get(`${uri}/error`)
        .ok((res) => {
          assert.strictEqual(500, res.status);
          calledOKHandler = true;
          return true;
        })
        .on('error', (err) => {
          calledErrorEvent = true;
        })
        .end((err, res) => {
          try {
            assert.ifError(err);
            assert.strictEqual(res.status, 500);
            assert(!calledErrorEvent);
            assert(calledOKHandler);
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should be an Error object', (done) => {
      let calledErrorEvent = false;
      request
        .get(`${uri}/error`)
        .on('error', (err) => {
          assert.strictEqual(err.status, 500);
          calledErrorEvent = true;
        })
        .end((err, res) => {
          try {
            if (NODE) {
              res.error.message.should.equal('cannot GET /error (500)');
            } else {
              res.error.message.should.equal(`cannot GET ${uri}/error (500)`);
            }

            assert.strictEqual(res.error.status, 500);
            assert(err, 'should have an error for 500');
            assert.equal(err.message, 'Internal Server Error');
            assert(calledErrorEvent);
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('with .then() promise', () => {
      if (typeof Promise === 'undefined') {
        return;
      }

      return request.get(`${uri}/error`).then(
        () => {
          assert.fail();
        },
        (err) => {
          assert.equal(err.message, 'Internal Server Error');
        }
      );
    });

    it('with .ok() returning false', () => {
      if (typeof Promise === 'undefined') {
        return;
      }

      return request
        .get(`${uri}/echo`)
        .ok(() => false)
        .then(
          () => {
            assert.fail();
          },
          (err) => {
            assert.equal(200, err.response.status);
            assert.equal(err.message, 'OK');
          }
        );
    });

    it('with .ok() throwing an Error', () => {
      if (typeof Promise === 'undefined') {
        return;
      }

      return request
        .get(`${uri}/echo`)
        .ok(() => {
          throw new Error('boom');
        })
        .then(
          () => {
            assert.fail();
          },
          (err) => {
            assert.equal(200, err.response.status);
            assert.equal(err.message, 'boom');
          }
        );
    });
  });

  describe('res.header', () => {
    it('should be an object', (done) => {
      request.get(`${uri}/login`).end((err, res) => {
        try {
          assert.equal('Express', res.header['x-powered-by']);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('set headers', () => {
    before(() => {
      Object.prototype.invalid = 'invalid';
    });

    after(() => {
      delete Object.prototype.invalid;
    });

    it('should only set headers for ownProperties of header', (done) => {
      try {
        request
          .get(`${uri}/echo-headers`)
          .set('valid', 'ok')
          .end((err, res) => {
            if (
              !err &&
              res.body &&
              res.body.valid &&
              !res.body.hasOwnProperty('invalid')
            ) {
              return done();
            }

            done(err || new Error('fail'));
          });
      } catch (err) {
        done(err);
      }
    });
  });

  describe('res.charset', () => {
    it('should be set when present', (done) => {
      request.get(`${uri}/login`).end((err, res) => {
        try {
          res.charset.should.equal('utf-8');
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('res.statusType', () => {
    it('should provide the first digit', (done) => {
      request.get(`${uri}/login`).end((err, res) => {
        try {
          assert(!err, 'should not have an error for success responses');
          assert.equal(200, res.status);
          assert.equal(2, res.statusType);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('res.type', () => {
    it('should provide the mime-type void of params', (done) => {
      request.get(`${uri}/login`).end((err, res) => {
        try {
          res.type.should.equal('text/html');
          res.charset.should.equal('utf-8');
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('req.set(field, val)', () => {
    it('should set the header field', (done) => {
      request
        .post(`${uri}/echo`)
        .set('X-Foo', 'bar')
        .set('X-Bar', 'baz')
        .end((err, res) => {
          try {
            assert.equal('bar', res.header['x-foo']);
            assert.equal('baz', res.header['x-bar']);
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.set(obj)', () => {
    it('should set the header fields', (done) => {
      request
        .post(`${uri}/echo`)
        .set({ 'X-Foo': 'bar', 'X-Bar': 'baz' })
        .end((err, res) => {
          try {
            assert.equal('bar', res.header['x-foo']);
            assert.equal('baz', res.header['x-bar']);
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.type(str)', () => {
    it('should set the Content-Type', (done) => {
      request
        .post(`${uri}/echo`)
        .type('text/x-foo')
        .end((err, res) => {
          try {
            res.header['content-type'].should.equal('text/x-foo');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should map "json"', (done) => {
      request
        .post(`${uri}/echo`)
        .type('json')
        .send('{"a": 1}')
        .end((err, res) => {
          try {
            res.should.be.json();
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should map "html"', (done) => {
      request
        .post(`${uri}/echo`)
        .type('html')
        .end((err, res) => {
          try {
            res.header['content-type'].should.equal('text/html');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.accept(str)', () => {
    it('should set Accept', (done) => {
      request
        .get(`${uri}/echo`)
        .accept('text/x-foo')
        .end((err, res) => {
          try {
            res.header.accept.should.equal('text/x-foo');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should map "json"', (done) => {
      request
        .get(`${uri}/echo`)
        .accept('json')
        .end((err, res) => {
          try {
            res.header.accept.should.equal('application/json');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should map "xml"', (done) => {
      request
        .get(`${uri}/echo`)
        .accept('xml')
        .end((err, res) => {
          try {
            // Mime module keeps changing this :(
            assert(
              res.header.accept == 'application/xml' ||
                res.header.accept == 'text/xml'
            );
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should map "html"', (done) => {
      request
        .get(`${uri}/echo`)
        .accept('html')
        .end((err, res) => {
          try {
            res.header.accept.should.equal('text/html');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.send(str)', () => {
    it('should write the string', (done) => {
      request
        .post(`${uri}/echo`)
        .type('json')
        .send('{"name":"tobi"}')
        .end((err, res) => {
          try {
            res.text.should.equal('{"name":"tobi"}');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.send(Object)', () => {
    it('should default to json', (done) => {
      request
        .post(`${uri}/echo`)
        .send({ name: 'tobi' })
        .end((err, res) => {
          try {
            res.should.be.json();
            res.text.should.equal('{"name":"tobi"}');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    describe('when called several times', () => {
      it('should merge the objects', (done) => {
        request
          .post(`${uri}/echo`)
          .send({ name: 'tobi' })
          .send({ age: 1 })
          .end((err, res) => {
            try {
              res.should.be.json();
              if (NODE) {
                res.buffered.should.be.true();
              }

              res.text.should.equal('{"name":"tobi","age":1}');
              done();
            } catch (err_) {
              done(err_);
            }
          });
      });
    });
  });

  describe('.end(fn)', () => {
    it('should check arity', (done) => {
      request
        .post(`${uri}/echo`)
        .send({ name: 'tobi' })
        .end((err, res) => {
          try {
            assert.ifError(err);
            res.text.should.equal('{"name":"tobi"}');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should emit request', (done) => {
      const req = request.post(`${uri}/echo`);
      req.on('request', (request) => {
        assert.equal(req, request);
        done();
      });
      req.end();
    });

    it('should emit response', (done) => {
      request
        .post(`${uri}/echo`)
        .send({ name: 'tobi' })
        .on('response', (res) => {
          res.text.should.equal('{"name":"tobi"}');
          done();
        })
        .end();
    });
  });

  describe('.then(fulfill, reject)', () => {
    it('should support successful fulfills with .then(fulfill)', (done) => {
      if (typeof Promise === 'undefined') {
        return done();
      }

      request
        .post(`${uri}/echo`)
        .send({ name: 'tobi' })
        .then((res) => {
          res.type.should.equal('application/json');
          res.text.should.equal('{"name":"tobi"}');
          done();
        });
    });

    it('should reject an error with .then(null, reject)', (done) => {
      if (typeof Promise === 'undefined') {
        return done();
      }

      request.get(`${uri}/error`).then(null, (err) => {
        assert.equal(err.status, 500);
        assert.equal(err.response.text, 'boom');
        done();
      });
    });
  });

  describe('.catch(reject)', () => {
    it('should reject an error with .catch(reject)', (done) => {
      if (typeof Promise === 'undefined') {
        return done();
      }

      request.get(`${uri}/error`).catch((err) => {
        assert.equal(err.status, 500);
        assert.equal(err.response.text, 'boom');
        done();
      });
    });
  });

  describe('.abort()', () => {
    it('should abort the request', (done) => {
      const req = request.get(`${uri}/delay/3000`);
      req.end((err, res) => {
        try {
          assert(false, 'should not complete the request');
        } catch (err_) {
          done(err_);
        }
      });

      req.on('error', (error) => {
        done(error);
      });
      req.on('abort', done);

      setTimeout(() => {
        req.abort();
      }, 500);
    });
    it('should abort the promise', () => {
      const req = request.get(`${uri}/delay/3000`);
      setTimeout(() => {
        req.abort();
      }, 10);
      return req.then(
        () => {
          assert.fail('should not complete the request');
        },
        (err) => {
          assert.equal('ABORTED', err.code);
        }
      );
    });

    it('should allow chaining .abort() several times', (done) => {
      const req = request.get(`${uri}/delay/3000`);
      req.end((err, res) => {
        try {
          assert(false, 'should not complete the request');
        } catch (err_) {
          done(err_);
        }
      });

      // This also verifies only a single 'done' event is emitted
      req.on('abort', done);

      setTimeout(() => {
        req.abort().abort().abort();
      }, 1000);
    });

    it('should not allow abort then end', (done) => {
      request
        .get(`${uri}/delay/3000`)
        .abort()
        .end((err, res) => {
          done(err ? undefined : new Error('Expected abort error'));
        });
    });
  });

  describe('req.toJSON()', () => {
    it('should describe the request', (done) => {
      const req = request.post(`${uri}/echo`).send({ foo: 'baz' });
      req.end((err, res) => {
        try {
          const json = req.toJSON();
          assert.equal('POST', json.method);
          assert(/\/echo$/.test(json.url));
          assert.equal('baz', json.data.foo);
          done();
        } catch (err_) {
          done(err_);
        }
      });
    });
  });

  describe('req.options()', () => {
    it('should allow request body', (done) => {
      request
        .options(`${uri}/options/echo/body`)
        .send({ foo: 'baz' })
        .end((err, res) => {
          try {
            assert.equal(err, null);
            assert.strictEqual(res.body.foo, 'baz');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });

  describe('req.sortQuery()', () => {
    it('nop with no querystring', (done) => {
      request
        .get(`${uri}/url`)
        .sortQuery()
        .end((err, res) => {
          try {
            assert.equal(res.text, '/url');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should sort the request querystring', (done) => {
      request
        .get(`${uri}/url`)
        .query('search=Manny')
        .query('order=desc')
        .sortQuery()
        .end((err, res) => {
          try {
            assert.equal(res.text, '/url?order=desc&search=Manny');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should allow disabling sorting', (done) => {
      request
        .get(`${uri}/url`)
        .query('search=Manny')
        .query('order=desc')
        .sortQuery() // take default of true
        .sortQuery(false) // override it in later call
        .end((err, res) => {
          try {
            assert.equal(res.text, '/url?search=Manny&order=desc');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

    it('should sort the request querystring using customized function', (done) => {
      request
        .get(`${uri}/url`)
        .query('name=Nick')
        .query('search=Manny')
        .query('order=desc')
        .sortQuery((a, b) => a.length - b.length)
        .end((err, res) => {
          try {
            assert.equal(res.text, '/url?name=Nick&order=desc&search=Manny');
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });
  });
});
