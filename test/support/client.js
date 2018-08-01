const request = require('../..');

if (process.env.HTTP2_TEST) {
  request.http2 = true;
}

exports = module.exports = request;
