const setup = require('./support/setup');

const base = setup.uri;
const assert = require('assert');
const request = require('./support/client');

describe('Agent', () => {
  it('should remember defaults', () => {
    if (typeof Promise === 'undefined') {
      return;
    }

    let called = 0;
    let event_called = 0;
    const agent = request
      .agent()
      .accept('json')
      .use(() => {
        called++;
      })
      .once('request', () => {
        event_called++;
      })
      .query({ hello: 'world' })
      .set('X-test', 'testing');
    assert.equal(0, called);
    assert.equal(0, event_called);

    return agent
      .get(`${base}/echo`)
      .then((res) => {
        assert.equal(1, called);
        assert.equal(1, event_called);
        assert.equal('application/json', res.headers.accept);
        assert.equal('testing', res.headers['x-test']);

        return agent.get(`${base}/querystring`);
      })
      .then((res) => {
        assert.equal(2, called);
        assert.equal(2, event_called);
        assert.deepEqual({ hello: 'world' }, res.body);
      });
  });
});
