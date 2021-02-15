'use strict';

const assert = require('assert');

const url = require('url');
const https = require('https');
const fs = require('fs');
const express = require('../support/express');
const request = require('../support/client');

const app = express();

const ca = fs.readFileSync(`${__dirname}/fixtures/ca.cert.pem`);
const key = fs.readFileSync(`${__dirname}/fixtures/key.pem`);
const pfx = fs.readFileSync(`${__dirname}/fixtures/cert.pfx`);
const cert = fs.readFileSync(`${__dirname}/fixtures/cert.pem`);
const passpfx = fs.readFileSync(`${__dirname}/fixtures/passcert.pfx`);

/*

openssl genrsa -out ca.key.pem 2048
openssl req -x509 -new -nodes -key ca.key.pem -sha256 -days 5000 -out ca.cert.pem # specify CN = CA

openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out cert.csr # specify CN = localhost

openssl x509 -req -in cert.csr -CA ca.cert.pem -CAkey ca.key.pem -CAcreateserial -out cert.pem -days 5000 -sha256
openssl pkcs12 -export -in cert.pem -inkey key.pem -out cert.pfx # empty password

openssl pkcs12 -export -in cert.pem -inkey key.pem -out passcert.pfx # password test

 */
let http2;
if (process.env.HTTP2_TEST) {
  http2 = require('http2');
}

let server;

app.get('/', (req, res) => {
  res.send('Safe and secure!');
});

// WARNING: this .listen() boilerplate is slightly different from most tests
// due to HTTPS. Do not copy/paste without examination.
const base = 'https://localhost';
let testEndpoint;

describe('https', () => {
  describe('certificate authority', () => {
    before(function listen(done) {
      server = process.env.HTTP2_TEST
        ? http2.createSecureServer(
            {
              key,
              cert
            },
            app
          )
        : https.createServer(
            {
              key,
              cert
            },
            app
          );

      server.listen(0, function listening() {
        testEndpoint = `${base}:${server.address().port}`;
        done();
      });
    });

    after(() => {
      if (server) server.close();
    });

    describe('request', () => {
      it('should give a good response', (done) => {
        request
          .get(testEndpoint)
          .ca(ca)
          .end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
      });

      it('should reject unauthorized response', () => {
        return request
          .get(testEndpoint)
          .trustLocalhost(false)
          .then(
            () => {
              throw new Error('Allows MITM');
            },
            () => {}
          );
      });

      it('should not reject unauthorized response', () => {
        return request
          .get(testEndpoint)
          .disableTLSCerts()
          .then(({ status }) => {
            assert.strictEqual(status, 200);
          });
      });

      it('should trust localhost unauthorized response', () => {
        return request.get(testEndpoint).trustLocalhost(true);
      });

      it('should trust overriden localhost unauthorized response', () => {
        return request
          .get(`https://example.com:${server.address().port}`)
          .connect('127.0.0.1')
          .trustLocalhost();
      });
    });

    describe('.agent', () => {
      it('should be able to make multiple requests without redefining the certificate', (done) => {
        const agent = request.agent({ ca });
        agent.get(testEndpoint).end((err, res) => {
          assert.ifError(err);
          assert(res.ok);
          assert.strictEqual('Safe and secure!', res.text);
          agent.get(url.parse(testEndpoint)).end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
        });
      });
    });
  });

  describe.skip('client certificates', () => {
    before(function listen(done) {
      server = process.env.HTTP2_TEST
        ? http2.createSecureServer(
            {
              ca,
              key,
              cert,
              requestCert: true,
              rejectUnauthorized: true
            },
            app
          )
        : https.createServer(
            {
              ca,
              key,
              cert,
              requestCert: true,
              rejectUnauthorized: true
            },
            app
          );

      server.listen(0, function listening() {
        testEndpoint = `${base}:${server.address().port}`;
        done();
      });
    });

    after(() => {
      if (server) server.close();
    });

    describe('request', () => {
      it('should give a good response with client certificates and CA', (done) => {
        request
          .get(testEndpoint)
          .ca(ca)
          .key(key)
          .cert(cert)
          .end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
      });
      it('should give a good response with client pfx', (done) => {
        request
          .get(testEndpoint)
          .pfx(pfx)
          .end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
      });
      it('should give a good response with client pfx with passphrase', (done) => {
        request
          .get(testEndpoint)
          .pfx({
            pfx: passpfx,
            passphrase: 'test'
          })
          .end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
      });
    });

    describe('.agent', () => {
      it('should be able to make multiple requests without redefining the certificates', (done) => {
        const agent = request.agent({ ca, key, cert });
        agent.get(testEndpoint).end((err, res) => {
          assert.ifError(err);
          assert(res.ok);
          assert.strictEqual('Safe and secure!', res.text);
          agent.get(url.parse(testEndpoint)).end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
        });
      });
      it('should be able to make multiple requests without redefining pfx', (done) => {
        const agent = request.agent({ pfx });
        agent.get(testEndpoint).end((err, res) => {
          assert.ifError(err);
          assert(res.ok);
          assert.strictEqual('Safe and secure!', res.text);
          agent.get(url.parse(testEndpoint)).end((err, res) => {
            assert.ifError(err);
            assert(res.ok);
            assert.strictEqual('Safe and secure!', res.text);
            done();
          });
        });
      });
    });
  });
});
