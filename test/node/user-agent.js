"use strict";
const assert = require("assert");
const request = require("../../");
const setup = require("../support/setup");
const base = setup.uri;

describe("req.get()", () => {
  it("should set a default user-agent", () =>
    request.put(`${base}/ua`).then(res => {
      assert(res.headers);
      assert(res.headers["user-agent"]);
      assert(
        /^node-superagent\/\d+\.\d+\.\d+(?:-[a-z]+\.\d+|$)/.test(
          res.headers["user-agent"]
        )
      );
    }));

  it("should be able to override user-agent", () =>
    request
      .put(`${base}/ua`)
      .set("User-Agent", "foo/bar")
      .then(res => {
        assert(res.headers);
        assert.equal(res.headers["user-agent"], "foo/bar");
      }));

  it("should be able to wipe user-agent", () =>
    request
      .put(`${base}/ua`)
      .unset("User-Agent")
      .then(res => {
        assert(res.headers);
        assert.equal(res.headers["user-agent"], void 0);
      }));
});
