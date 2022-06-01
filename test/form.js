const assert = require('assert');
const should = require('should');

const getSetup = require('./support/setup');
const request = require('./support/client');

if (!assert.deepStrictEqual) assert.deepStrictEqual = assert.deepEqual;

describe('req.send(Object) as "form"', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('with req.type() set to form', () => {
    it('should send x-www-form-urlencoded data', (done) => {
      request
        .post(`${base}/echo`)
        .type('form')
        .send({ name: 'tobi' })
        .end((error, res) => {
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
        .end((error, res) => {
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
      .end((error, res) => {
        done();
      });
  });
});

describe('req.field', function () {
  let setup;
  let base;
  let formDataSupported;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;

    formDataSupported = setup.NODE || FormData !== 'undefined';
  });

  this.timeout(5000);
  it('allow bools', (done) => {
    if (!formDataSupported) {
      return done();
    }

    request
      .post(`${base}/formecho`)
      .field('bools', true)
      .field('strings', 'true')
      .end((error, res) => {
        assert.ifError(error);
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
      .end((error, res) => {
        assert.ifError(error);
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
      .end((error, res) => {
        assert.ifError(error);
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
      .end((error, res) => {
        assert.ifError(error);
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
