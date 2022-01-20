const assert = require('assert');
const request = require('../support/client');

describe('xdomain', function () {
  this.timeout(20_000);

  // TODO (defunctzombie) I am not certain this actually forces xdomain request
  // use localtunnel.me and tunnel127.com alias instead
  it('should support req.withCredentials()', (next) => {
    request
      .get(`//${window.location.host}/xdomain`)
      .withCredentials()
      .end((error, res) => {
        assert.equal(200, res.status);
        assert.equal('tobi', res.text);
        next();
      });
  });

  // xdomain not supported in old IE and IE11 gives weird Jetty errors (looks like a SauceLabs issue)
  const isIE11 = Boolean(/Trident.*rv[ :]*11\./.test(navigator.userAgent));
  const isIE9OrOlder = !window.atob;
  if (!isIE9OrOlder && !isIE11) {
    // Don't run on IE9 or older, or IE11
    it('should handle x-domain failure', (next) => {
      request.get('//tunne127.com').end((error, res) => {
        assert(error, 'error missing');
        assert(error.crossDomain, 'not .crossDomain');
        next();
      });
    });

    it('should handle x-domain failure after repeat attempts', (next) => {
      request
        .get('//tunne127.com')
        .retry(2)
        .end((error, res) => {
          try {
            assert(error, 'error missing');
            assert(error.crossDomain, 'not .crossDomain');
            assert.equal(2, error.retries, 'expected an error with .retries');
            next();
          } catch (err) {
            next(err);
          }
        });
    });
  }
});
