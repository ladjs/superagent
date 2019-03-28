"use strict";

function Agent() {
  this._defaults = [];
}

['use', 'on', 'once', 'set', 'query', 'type', 'accept', 'auth', 'withCredentials', 'sortQuery', 'retry', 'ok', 'redirects', 'timeout', 'buffer', 'serialize', 'parse', 'ca', 'key', 'pfx', 'cert'].forEach(fn => {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function (...args) {
    this._defaults.push({
      fn,
      args
    });

    return this;
  };
});

Agent.prototype._setDefaults = function (req) {
  this._defaults.forEach(def => {
    req[def.fn](...def.args);
  });
};

module.exports = Agent;