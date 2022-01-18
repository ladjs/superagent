const process = require('process');
const express = require('express');

let http2Request;
let http2Res;
if (process.env.HTTP2_TEST) {
  const http2 = require('http2');
  const requestDecorator = require('./requestDecorator');
  const responseDecorator = require('./responseDecorator');
  http2Request = requestDecorator(
    Object.create(http2.Http2ServerRequest.prototype)
  );
  http2Res = responseDecorator(Object.create(http2.Http2ServerResponse.prototype));
}

function createApp() {
  const app = express();
  if (process.env.HTTP2_TEST) {
    app.request = Object.create(http2Request, {
      app: { configurable: true, enumerable: true, writable: true, value: app }
    });
    app.response = Object.create(http2Res, {
      app: { configurable: true, enumerable: true, writable: true, value: app }
    });
  }

  return app;
}

module.exports = createApp;
