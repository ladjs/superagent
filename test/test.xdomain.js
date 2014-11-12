
var assert = require('assert');
var request = require('../');

test('req.withCredentials()', function(next){
  request
  .get('//' + window.location.host + '/xdomain')
  .withCredentials()
  .end(function(res){
    assert(200 == res.status);
    assert('tobi' == res.text);
    next();
  })
})

test('x-domain failure', function(next){
  request
  .get('//google.com')
  .end(function(err, res){
    assert(err, 'error missing');
    assert(err.crossDomain, 'not .crossDomain');
    next();
  });
});

