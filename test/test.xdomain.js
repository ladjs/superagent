
var assert = require('assert');
var request = require('../');

test('req.withCredentials()', function(next){

  // we force port 80 here when we don't know
  // this works on localhost testing cause we have a port
  // but on regular localtunnel.me we don't
  // and since localtunnel.me loads over https, port 80
  // becomes cross domain
  var port = window.location.port || 80;
  var hostname = window.location.hostname;

  request
  .get('http://' + hostname + ':' + port + '/xdomain')
  .withCredentials()
  .end(function(res){
    assert(200 == res.status);
    assert('tobi' == res.text);
    next();
  })
})

test('x-domain failure', function(next){
  request
  .get('http://google.com')
  .end(function(err, res){
    assert(err, 'error missing');
    assert(err.crossDomain, 'not .crossDomain');
    next();
  });
});

