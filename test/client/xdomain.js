var assert = require('assert');
var request = require('../../');

describe('xdomain', function(){

  // TODO (defunctzombie) I am not certain this actually forces xdomain request
  // use localtunnel.me and tunnel127.com alias instead
  it('should support req.withCredentials()', function(next){
    request
    .get('//' + window.location.host + '/xdomain')
    .withCredentials()
    .end(function(res){
      assert(200 == res.status);
      assert('tobi' == res.text);
      next();
    })
  })

  it('should handle x-domain failure', function(next){
    request
    .get('//tunne127.com')
    .end(function(err, res){
      assert(err, 'error missing');
      assert(err.crossDomain, 'not .crossDomain');
      next();
    });
  });
});
