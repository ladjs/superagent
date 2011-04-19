
/**
 * Module dependencies.
 */

var agent = require('../');

var req = agent.get('http://google.com', function(err, res, body){
  console.log(res.statusCode);
  console.log(body);
});

req.on('redirect', function(location){
  console.log('redirecting to %s', location);
});
