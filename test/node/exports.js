'use strict';
const request = require('../support/client');

describe('exports', () => {
  it('should expose .protocols', () => {
    Object.keys(request.protocols).should.eql(['http:', 'https:', 'http2:']);
  });

  it('should expose .serialize', () => {
    Object.keys(request.serialize).should.eql([
      'application/x-www-form-urlencoded',
      'application/json'
    ]);
  });

  it('should expose .parse', () => {
    Object.keys(request.parse).should.eql([
      'application/x-www-form-urlencoded',
      'application/json',
      'text',
      'application/octet-stream',
      'application/pdf',
      'image'
    ]);
  });

  it('should export .buffer', () => {
    Object.keys(request.buffer).should.eql([]);
  });
});
