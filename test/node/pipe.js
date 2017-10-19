"use strict";
const request = require("../../"),
  express = require("express"),
  app = express(),
  fs = require("fs"),
  bodyParser = require("body-parser");

app.use(bodyParser.json());

app.get("/", (req, res) => {
  fs.createReadStream("test/node/fixtures/user.json").pipe(res);
});

app.post("/", (req, res) => {
  res.send(req.body);
});

let base = "http://localhost";
let server;
before(function listen(done) {
  server = app.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe("request pipe", () => {
  const destPath = "test/node/fixtures/tmp.json";

  after(function removeTmpfile(done) {
    fs.unlink(destPath, done);
  });

  it("should act as a writable stream", done => {
    const req = request.post(base);
    const stream = fs.createReadStream("test/node/fixtures/user.json");

    req.type("json");

    req.on("response", res => {
      res.body.should.eql({ name: "tobi" });
      done();
    });

    stream.pipe(req);
  });

  it("should act as a readable stream", done => {
    const stream = fs.createWriteStream(destPath);

    let responseCalled = false;
    const req = request.get(base);
    req.type("json");

    req.on("response", res => {
      res.should.have.status(200);
      responseCalled = true;
    });
    stream.on("finish", () => {
      JSON.parse(fs.readFileSync(destPath, "utf8")).should.eql({
        name: "tobi",
      });
      responseCalled.should.be.true();
      done();
    });
    req.pipe(stream);
  });
});
