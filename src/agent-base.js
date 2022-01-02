function Agent() {
  this._defaults = [];
}

for (const fn of [
  'use',
  'on',
  'once',
  'set',
  'query',
  'type',
  'accept',
  'auth',
  'withCredentials',
  'sortQuery',
  'retry',
  'ok',
  'redirects',
  'timeout',
  'buffer',
  'serialize',
  'parse',
  'ca',
  'key',
  'pfx',
  'cert',
  'disableTLSCerts'
]) {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function (...args) {
    this._defaults.push({ fn, args });
    return this;
  };
}

Agent.prototype._setDefaults = function (request) {
  for (const def of this._defaults) {
    request[def.fn](...def.args);
  }
};

module.exports = Agent;
