"use strict";
const request = require("../../"),
  express = require("express"),
  assert = require("assert"),
  app = express(),
  app2 = express(),
  should = require("should");

let base = "http://localhost";
let server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

let base2 = "http://localhost";
let server2;
before(function listen(done) {
  server2 = app2.listen(0, function listening() {
    base2 += `:${server2.address().port}`;
    done();
  });
});

app.all("/test-301", (req, res) => {
  res.redirect(301, `${base2}/`);
});
app.all("/test-302", (req, res) => {
  res.redirect(302, `${base2}/`);
});
app.all("/test-303", (req, res) => {
  res.redirect(303, `${base2}/`);
});
app.all("/test-307", (req, res) => {
  res.redirect(307, `${base2}/`);
});
app.all("/test-308", (req, res) => {
  res.redirect(308, `${base2}/`);
});

app2.all("/", (req, res) => {
  res.send(req.method);
});

describe("request.get", () => {
  describe("on 301 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .get(`${base}/test-301`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 302 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .get(`${base}/test-302`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 303 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .get(`${base}/test-303`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 307 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .get(`${base}/test-307`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 308 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .get(`${base}/test-308`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
});

describe("request.post", () => {
  describe("on 301 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .post(`${base}/test-301`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 302 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .post(`${base}/test-302`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 303 redirect", () => {
    it("should follow Location with a GET request", done => {
      const req = request
        .post(`${base}/test-303`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("GET");
          done();
        });
    });
  });
  describe("on 307 redirect", () => {
    it("should follow Location with a POST request", done => {
      const req = request
        .post(`${base}/test-307`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("POST");
          done();
        });
    });
  });
  describe("on 308 redirect", () => {
    it("should follow Location with a POST request", done => {
      const req = request
        .post(`${base}/test-308`)
        .redirects(1)
        .end((err, res) => {
          req.req._headers.host.should.eql(
            `localhost:${server2.address().port}`
          );
          res.status.should.eql(200);
          res.text.should.eql("POST");
          done();
        });
    });
  });
});
