'use strict';
const assert = require('assert');
const net = require('net');
const request = require('../support/client');
const express = require('../support/express');

function getFreePort(fn) {
  const server = net.createServer();
  server.listen(0, () => {
    const { port } = server.address();
    server.close(() => {
      fn(port);
    });
  });
}

describe('with network error', () => {
  before(function (done) {
    // connecting to a free port
    // will trigger a connection refused
    getFreePort((port) => {
      this.port = port;
      done();
    });
  });

  it('should error', function (done) {
    request.get(`http://localhost:${this.port}/`).end((err, res) => {
      assert(err, 'expected an error');
      done();
    });
  });
});
