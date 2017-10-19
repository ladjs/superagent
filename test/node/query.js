"use strict";
const request = require("../.."),
  express = require("express"),
  assert = require("assert"),
  fs = require("fs"),
  app = express();

app.get("/", (req, res) => {
  res.status(200).send(req.query);
});

app.delete("/url", (req, res) => {
  res.status(200).send(req.url);
});

app.delete("/", (req, res) => {
  res.status(200).send(req.query);
});

app.put("/", (req, res) => {
  res.status(200).send(req.query);
});

let base = "http://localhost";
let server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe("req.query(String)", () => {
  // This is no longer true as of qs v3.0.0 (https://github.com/ljharb/qs/commit/0c6f2a6318c94f6226d3cf7fe36094e9685042b6)
  // it('should supply uri malformed error to the callback')

  it("should support passing in a string", done => {
    request
      .del(base)
      .query("name=t%F6bi")
      .end((err, res) => {
        res.body.should.eql({ name: "t%F6bi" });
        done();
      });
  });

  it("should work with url query-string and string for query", done => {
    request
      .del(`${base}/?name=tobi`)
      .query("age=2%20")
      .end((err, res) => {
        res.body.should.eql({ name: "tobi", age: "2 " });
        done();
      });
  });

  it("should support compound elements in a string", done => {
    request
      .del(base)
      .query("name=t%F6bi&age=2")
      .end((err, res) => {
        res.body.should.eql({ name: "t%F6bi", age: "2" });
        done();
      });
  });

  it("should work when called multiple times with a string", done => {
    request
      .del(base)
      .query("name=t%F6bi")
      .query("age=2%F6")
      .end((err, res) => {
        res.body.should.eql({ name: "t%F6bi", age: "2%F6" });
        done();
      });
  });

  it("should work with normal `query` object and query string", done => {
    request
      .del(base)
      .query("name=t%F6bi")
      .query({ age: "2" })
      .end((err, res) => {
        res.body.should.eql({ name: "t%F6bi", age: "2" });
        done();
      });
  });
});

describe("req.query(Object)", () => {
  it("should construct the query-string", done => {
    request
      .del(base)
      .query({ name: "tobi" })
      .query({ order: "asc" })
      .query({ limit: ["1", "2"] })
      .end((err, res) => {
        res.body.should.eql({ name: "tobi", order: "asc", limit: ["1", "2"] });
        done();
      });
  });

  it("should not error on dates", done => {
    const date = new Date(0);

    request
      .del(base)
      .query({ at: date })
      .end((err, res) => {
        assert.equal(date.toISOString(), res.body.at);
        done();
      });
  });

  it("should work after setting header fields", done => {
    request
      .del(base)
      .set("Foo", "bar")
      .set("Bar", "baz")
      .query({ name: "tobi" })
      .query({ order: "asc" })
      .query({ limit: ["1", "2"] })
      .end((err, res) => {
        res.body.should.eql({ name: "tobi", order: "asc", limit: ["1", "2"] });
        done();
      });
  });

  it("should append to the original query-string", done => {
    request
      .del(`${base}/?name=tobi`)
      .query({ order: "asc" })
      .end((err, res) => {
        res.body.should.eql({ name: "tobi", order: "asc" });
        done();
      });
  });

  it("should retain the original query-string", done => {
    request.del(`${base}/?name=tobi`).end((err, res) => {
      res.body.should.eql({ name: "tobi" });
      done();
    });
  });

  it("should keep only keys with null querystring values", done => {
    request
      .del(`${base}/url`)
      .query({ nil: null })
      .end((err, res) => {
        res.text.should.equal("/url?nil");
        done();
      });
  });

  it("query-string should be sent on pipe", done => {
    const req = request.put(`${base}/?name=tobi`);
    const stream = fs.createReadStream("test/node/fixtures/user.json");

    req.on("response", res => {
      res.body.should.eql({ name: "tobi" });
      done();
    });

    stream.pipe(req);
  });
});
