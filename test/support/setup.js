require('should');
require('should-http');

var NODE = true;
var uri = 'http://localhost:5000';
if (typeof window !== 'undefined') {
  NODE = false;
  uri = '//' + window.location.host;
}
else {
  process.env.ZUUL_PORT = 5000;
  require('./server');
}

exports.NODE = NODE;
exports.uri = uri;
