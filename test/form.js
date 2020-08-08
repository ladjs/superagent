const setup = require('./support/setup');

const base = setup.uri;
const should = require('should');
const request = require('./support/client');

const assert = require('assert');

if (!assert.deepStrictEqual) assert.deepStrictEqual = assert.deepEqual;

const formDataSupported = setup.NODE || FormData !== 'undefined';

describe('req.send(Object) as "form"', () => {
  describe('with req.type() set to form', () => {
    it('should send x-www-form-urlencoded data', (done) => {
      request
        .post(`${base}/echo`)
        .type('form')
        .send({ name: 'tobi' })
        .end((err, res) => {
          res.header['content-type'].should.equal(
            'application/x-www-form-urlencoded'
          );
          res.text.should.equal('name=tobi');
          done();
        });
    });
  });

  describe('when called several times', () => {
    it('should merge the objects', (done) => {
      request
        .post(`${base}/echo`)
        .type('form')
        .send({ name: { first: 'tobi', last: 'holowaychuk' } })
        .send({ age: '1' })
        .end((err, res) => {
          res.header['content-type'].should.equal(
            'application/x-www-form-urlencoded'
          );
          res.text.should.equal(
            'name%5Bfirst%5D=tobi&name%5Blast%5D=holowaychuk&age=1'
          );
          done();
        });
    });
  });
});

describe('req.attach', () => {
  it('ignores null file', (done) => {
    request
      .post('/echo')
      .attach('image', null)
      .end((err, res) => {
        done();
      });
  });
});

describe('req.field', function () {
  this.timeout(5000);
  it('allow bools', (done) => {
    if (!formDataSupported) {
      return done();
    }

    request
      .post(`${base}/formecho`)
      .field('bools', true)
      .field('strings', 'true')
      .end((err, res) => {
        assert.ifError(err);
        assert.deepStrictEqual(res.body, { bools: 'true', strings: 'true' });
        done();
      });
  });

  it('allow objects', (done) => {
    if (!formDataSupported) {
      return done();
    }

    request
      .post(`${base}/formecho`)
      .field({ bools: true, strings: 'true' })
      .end((err, res) => {
        assert.ifError(err);
        assert.deepStrictEqual(res.body, { bools: 'true', strings: 'true' });
        done();
      });
  });

  it('works with arrays in objects', (done) => {
    if (!formDataSupported) {
      return done();
    }

    request
      .post(`${base}/formecho`)
      .field({ numbers: [1, 2, 3] })
      .end((err, res) => {
        assert.ifError(err);
        assert.deepStrictEqual(res.body, { numbers: ['1', '2', '3'] });
        done();
      });
  });

  it('works with arrays', (done) => {
    if (!formDataSupported) {
      return done();
    }

    request
      .post(`${base}/formecho`)
      .field('letters', ['a', 'b', 'c'])
      .end((err, res) => {
        assert.ifError(err);
        assert.deepStrictEqual(res.body, { letters: ['a', 'b', 'c'] });
        done();
      });
  });

  it('throw when empty', () => {
    should.throws(() => {
      request.post(`${base}/echo`).field();
    }, /name/);

    should.throws(() => {
      request.post(`${base}/echo`).field('name');
    }, /val/);
  });

  it('cannot be mixed with send()', () => {
    assert.throws(() => {
      request.post('/echo').field('form', 'data').send('hi');
    });

    assert.throws(() => {
      request.post('/echo').send('hi').field('form', 'data');
    });
  });
});
