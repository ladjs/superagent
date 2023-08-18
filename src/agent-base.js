const defaults = [
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
]

class Agent {
  constructor () {
    this._defaults = [];
  }

  _setDefaults (request) {
    for (const def of this._defaults) {
      request[def.fn](...def.args);
    }
  }
}

for (const fn of defaults) {
  // Default setting for all requests from this agent
  Agent.prototype[fn] = function (...args) {
    this._defaults.push({ fn, args });
    return this;
  };
}


module.exports = Agent;
