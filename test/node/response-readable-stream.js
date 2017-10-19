"use strict";
const request = require("../../"),
  express = require("express"),
  app = express(),
  fs = require("fs");

app.get("/", (req, res) => {
  fs.createReadStream("test/node/fixtures/user.json").pipe(res);
});

let base = "http://localhost";
let server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe("response", () => {
  it("should act as a readable stream", done => {
    const req = request.get(base).buffer(false);

    req.end((err, res) => {
      if (err) return done(err);
      let trackEndEvent = 0;
      let trackCloseEvent = 0;

      res.on("end", () => {
        trackEndEvent++;
        trackEndEvent.should.equal(1);
        trackCloseEvent.should.equal(0); // close should not have been called
        done();
      });

      res.on("close", () => {
        trackCloseEvent++;
      });

      (() => {
        res.pause();
      }).should.not.throw();
      (() => {
        res.resume();
      }).should.not.throw();
      (() => {
        res.destroy();
      }).should.not.throw();
    });
  });
});
