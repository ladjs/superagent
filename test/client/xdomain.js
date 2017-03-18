var assert = require('assert');
var request = require('../../');

describe('xdomain', function(){
  this.timeout(20000);

  // TODO (defunctzombie) I am not certain this actually forces xdomain request
  // use localtunnel.me and tunnel127.com alias instead
  it('should support req.withCredentials()', function(next){
    request
    .get('//' + window.location.host + '/xdomain')
    .withCredentials()
    .end(function(err, res){
      assert.equal(200, res.status);
      assert.equal('tobi', res.text);
      next();
    });
  });

  // xdomain not supported in old IE and IE11 gives weird Jetty errors (looks like a SauceLabs issue)
  var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
  var isIE9OrOlder = !window.atob;
  if (!isIE9OrOlder && !isIE11) { // Don't run on IE9 or older, or IE11
    it('should handle x-domain failure', function(next){
      request
      .get('//tunne127.com')
      .end(function(err, res){
        assert(err, 'error missing');
        assert(err.crossDomain, 'not .crossDomain');
        next();
      });
    });

    it('should handle x-domain failure after repeat attempts', function(next){
      request
      .get('//tunne127.com')
      .retry(2)
      .end(function(err, res){
        try {
          assert(err, 'error missing');
          assert(err.crossDomain, 'not .crossDomain');
          assert.equal(2, err.retries, 'expected an error with .retries');
          next();
        } catch(err) {
          next(err);
        }
      });
    });
  }
});
