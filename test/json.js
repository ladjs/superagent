const setup = require('./support/setup');

const { uri } = setup;
const doesntWorkInBrowserYet = setup.NODE;
const doesntWorkInHttp2 = !process.env.HTTP2_TEST;

const assert = require('assert');
const request = require('./support/client');

describe('req.send(Object) as "json"', function () {
  this.timeout(20000);

  it('should default to json', (done) => {
    request
      .post(`${uri}/echo`)
      .send({ name: 'tobi' })
      .end((err, res) => {
        res.should.be.json();
        res.text.should.equal('{"name":"tobi"}');
        done();
      });
  });

  it('should work with arrays', (done) => {
    request
      .post(`${uri}/echo`)
      .send([1, 2, 3])
      .end((err, res) => {
        res.should.be.json();
        res.text.should.equal('[1,2,3]');
        done();
      });
  });

  it('should work with value null', (done) => {
    request
      .post(`${uri}/echo`)
      .type('json')
      .send('null')
      .end((err, res) => {
        res.should.be.json();
        assert.strictEqual(res.body, null);
        done();
      });
  });

  it('should work with value false', (done) => {
    request
      .post(`${uri}/echo`)
      .type('json')
      .send('false')
      .end((err, res) => {
        res.should.be.json();
        res.body.should.equal(false);
        done();
      });
  });

  if (doesntWorkInBrowserYet)
    it('should work with value 0', (done) => {
      // fails in IE9
      request
        .post(`${uri}/echo`)
        .type('json')
        .send('0')
        .end((err, res) => {
          res.should.be.json();
          res.body.should.equal(0);
          done();
        });
    });

  it('should work with empty string value', (done) => {
    request
      .post(`${uri}/echo`)
      .type('json')
      .send('""')
      .end((err, res) => {
        res.should.be.json();
        res.body.should.equal('');
        done();
      });
  });

  if (doesntWorkInBrowserYet && doesntWorkInHttp2)
    it('should work with GET', (done) => {
      request
        .get(`${uri}/echo`)
        .send({ tobi: 'ferret' })
        .end((err, res) => {
          try {
            res.should.be.json();
            res.text.should.equal('{"tobi":"ferret"}');
            ({ tobi: 'ferret' }.should.eql(res.body));
            done();
          } catch (err_) {
            done(err_);
          }
        });
    });

  it('should work with vendor MIME type', (done) => {
    request
      .post(`${uri}/echo`)
      .set('Content-Type', 'application/vnd.example+json')
      .send({ name: 'vendor' })
      .end((err, res) => {
        res.text.should.equal('{"name":"vendor"}');
        ({ name: 'vendor' }.should.eql(res.body));
        done();
      });
  });

  describe('when called several times', () => {
    it('should merge the objects', (done) => {
      request
        .post(`${uri}/echo`)
        .send({ name: 'tobi' })
        .send({ age: 1 })
        .end((err, res) => {
          res.should.be.json();
          res.text.should.equal('{"name":"tobi","age":1}');
          ({ name: 'tobi', age: 1 }.should.eql(res.body));
          done();
        });
    });
  });
});

describe('res.body', function () {
  this.timeout(20000);

  describe('application/json', () => {
    it('should parse the body', (done) => {
      request.get(`${uri}/json`).end((err, res) => {
        res.text.should.equal('{"name":"manny"}');
        res.body.should.eql({ name: 'manny' });
        done();
      });
    });
  });

  if (doesntWorkInBrowserYet)
    describe('HEAD requests', () => {
      it('should not throw a parse error', (done) => {
        request.head(`${uri}/json`).end((err, res) => {
          try {
            assert.strictEqual(err, null);
            assert.strictEqual(res.text, undefined);
            assert.strictEqual(Object.keys(res.body).length, 0);
            done();
          } catch (err_) {
            done(err_);
          }
        });
      });
    });

  describe('Invalid JSON response', () => {
    it('should return the raw response', (done) => {
      request.get(`${uri}/invalid-json`).end((err, res) => {
        assert.deepEqual(
          err.rawResponse,
          ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
        );
        done();
      });
    });

    it('should return the http status code', (done) => {
      request.get(`${uri}/invalid-json-forbidden`).end((err, res) => {
        assert.equal(err.statusCode, 403);
        done();
      });
    });
  });

  if (doesntWorkInBrowserYet)
    describe('No content', () => {
      it('should not throw a parse error', (done) => {
        request.get(`${uri}/no-content`).end((err, res) => {
          try {
            assert.strictEqual(err, null);
            assert.strictEqual(res.text, '');
            assert.strictEqual(Object.keys(res.body).length, 0);
            done();
          } catch (err_) {
            done(err_);
          }
        });
      });
    });

  if (doesntWorkInBrowserYet)
    describe('application/json+hal', () => {
      it('should parse the body', (done) => {
        request.get(`${uri}/json-hal`).end((err, res) => {
          if (err) return done(err);
          res.text.should.equal('{"name":"hal 5000"}');
          res.body.should.eql({ name: 'hal 5000' });
          done();
        });
      });
    });

  if (doesntWorkInBrowserYet)
    describe('vnd.collection+json', () => {
      it('should parse the body', (done) => {
        request.get(`${uri}/collection-json`).end((err, res) => {
          res.text.should.equal('{"name":"chewbacca"}');
          res.body.should.eql({ name: 'chewbacca' });
          done();
        });
      });
    });
});
