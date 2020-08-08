'use strict';
const assert = require('assert');
const request = require('../support/client');
const express = require('../support/express');

const app = express();
const app2 = express();
const should = require('should');
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

let base = 'http://localhost';
let server;
before(function listen(done) {
  server = http.createServer(app);
  server = server.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

let base2 = 'http://localhost';
let server2;
before(function listen(done) {
  server2 = http.createServer(app2);
  server2 = server2.listen(0, function listening() {
    base2 += `:${server2.address().port}`;
    done();
  });
});

app.all('/test-301', (req, res) => {
  res.redirect(301, `${base2}/`);
});
app.all('/test-302', (req, res) => {
  res.redirect(302, `${base2}/`);
});
app.all('/test-303', (req, res) => {
  res.redirect(303, `${base2}/`);
});
app.all('/test-307', (req, res) => {
  res.redirect(307, `${base2}/`);
});
app.all('/test-308', (req, res) => {
  res.redirect(308, `${base2}/`);
});

app2.all('/', (req, res) => {
  res.send(req.method);
});

describe('request.get', () => {
  describe('on 301 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.get(`${base}/test-301`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 302 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.get(`${base}/test-302`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 303 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.get(`${base}/test-303`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 307 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.get(`${base}/test-307`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 308 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.get(`${base}/test-308`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
});

describe('request.post', () => {
  describe('on 301 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.post(`${base}/test-301`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 302 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.post(`${base}/test-302`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 303 redirect', () => {
    it('should follow Location with a GET request', (done) => {
      const req = request.post(`${base}/test-303`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('GET');
        done();
      });
    });
  });
  describe('on 307 redirect', () => {
    it('should follow Location with a POST request', (done) => {
      const req = request.post(`${base}/test-307`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('POST');
        done();
      });
    });
  });
  describe('on 308 redirect', () => {
    it('should follow Location with a POST request', (done) => {
      const req = request.post(`${base}/test-308`).redirects(1);
      req.end((err, res) => {
        const headers = req.req.getHeaders
          ? req.req.getHeaders()
          : req.req._headers;
        headers.host.should.eql(`localhost:${server2.address().port}`);
        res.status.should.eql(200);
        res.text.should.eql('POST');
        done();
      });
    });
  });
});
