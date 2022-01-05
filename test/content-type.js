const assert = require('assert');
const getSetup = require('./support/setup');

const request = require('./support/client');

describe('req.set("Content-Type", contentType)', async function () {
  const setup = await getSetup();
  const { uri } = setup;

  this.timeout(20_000);

  it('should work with just the contentType component', (done) => {
    request
      .post(`${uri}/echo`)
      .set('Content-Type', 'application/json')
      .send({ name: 'tobi' })
      .end((error, res) => {
        assert(!error);
        done();
      });
  });

  it('should work with the charset component', (done) => {
    request
      .post(`${uri}/echo`)
      .set('Content-Type', 'application/json; charset=utf-8')
      .send({ name: 'tobi' })
      .end((error, res) => {
        assert(!error);
        done();
      });
  });
});
