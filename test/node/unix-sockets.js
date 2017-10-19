"use strict";
const request = require("../../");
const express = require("express");
const assert = require("assert");
const app = express();
const http = require("http");
const https = require("https");
const os = require("os");
const fs = require("fs");
const key = fs.readFileSync(`${__dirname}/fixtures/key.pem`);
const cert = fs.readFileSync(`${__dirname}/fixtures/cert.pem`);
const httpSockPath = [os.tmpdir(), "superagent-http.sock"].join("/");
const httpsSockPath = [os.tmpdir(), "superagent-https.sock"].join("/");
let httpServer;
let httpsServer;

app.get("/", (req, res) => {
  res.send("root ok!");
});

app.get("/request/path", (req, res) => {
  res.send("request path ok!");
});

describe("[unix-sockets] http", () => {
  if (process.platform === "win32") {
    return;
  }

  before(done => {
    if (fs.existsSync(httpSockPath) === true) {
      // try unlink if sock file exists
      fs.unlinkSync(httpSockPath);
    }
    httpServer = http.createServer(app);
    httpServer.listen(httpSockPath, done);
  });

  const base = `http+unix://${httpSockPath.replace(/\//g, "%2F")}`;

  describe("request", () => {
    it("path: / (root)", done => {
      request.get(`${base}/`).end((err, res) => {
        assert(res.ok);
        assert.strictEqual("root ok!", res.text);
        done();
      });
    });

    it("path: /request/path", done => {
      request.get(`${base}/request/path`).end((err, res) => {
        assert(res.ok);
        assert.strictEqual("request path ok!", res.text);
        done();
      });
    });
  });

  after(done => {
    httpServer.close(done);
  });
});

describe("[unix-sockets] https", () => {
  if (process.platform === "win32") {
    return;
  }

  before(done => {
    if (fs.existsSync(httpsSockPath) === true) {
      // try unlink if sock file exists
      fs.unlinkSync(httpsSockPath);
    }
    httpsServer = https.createServer({ key, cert }, app);
    httpsServer.listen(httpsSockPath, done);
  });

  const base = `https+unix://${httpsSockPath.replace(/\//g, "%2F")}`;

  describe("request", () => {
    it("path: / (root)", done => {
      request
        .get(`${base}/`)
        .ca(cert)
        .end((err, res) => {
          assert(res.ok);
          assert.strictEqual("root ok!", res.text);
          done();
        });
    });

    it("path: /request/path", done => {
      request
        .get(`${base}/request/path`)
        .ca(cert)
        .end((err, res) => {
          assert(res.ok);
          assert.strictEqual("request path ok!", res.text);
          done();
        });
    });
  });

  after(done => {
    httpsServer.close(done);
  });
});
