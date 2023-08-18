/**
 * Module dependencies.
 */

// eslint-disable-next-line node/no-deprecated-api
const { parse } = require('url');
const { CookieJar } = require('cookiejar');
const { CookieAccessInfo } = require('cookiejar');
const methods = require('methods');
const request = require('../..');
const AgentBase = require('../agent-base');

/**
 * Initialize a new `Agent`.
 *
 * @api public
 */

class Agent extends AgentBase {
  constructor (options) {
    super();

    this.jar = new CookieJar();

    if (options) {
      if (options.ca) {
        this.ca(options.ca);
      }

      if (options.key) {
        this.key(options.key);
      }

      if (options.pfx) {
        this.pfx(options.pfx);
      }

      if (options.cert) {
        this.cert(options.cert);
      }

      if (options.rejectUnauthorized === false) {
        this.disableTLSCerts();
      }
    }
  }

  /**
   * Save the cookies in the given `res` to
   * the agent's cookie jar for persistence.
   *
   * @param {Response} res
   * @api private
   */
  _saveCookies (res) {
    const cookies = res.headers['set-cookie'];
    if (cookies) {
      const url = parse(res.request?.url || '');
      this.jar.setCookies(cookies, url.hostname, url.pathname);
    }
  }

  /**
   * Attach cookies when available to the given `req`.
   *
   * @param {Request} req
   * @api private
   */
  _attachCookies (request_) {
    const url = parse(request_.url);
    const access = new CookieAccessInfo(
      url.hostname,
      url.pathname,
      url.protocol === 'https:'
    );
    const cookies = this.jar.getCookies(access).toValueString();
    request_.cookies = cookies;
  }
}

for (const name of methods) {
  const method = name.toUpperCase();
  Agent.prototype[name] = function (url, fn) {
    const request_ = new request.Request(method, url);

    request_.on('response', this._saveCookies.bind(this));
    request_.on('redirect', this._saveCookies.bind(this));
    request_.on('redirect', this._attachCookies.bind(this, request_));
    this._setDefaults(request_);
    this._attachCookies(request_);

    if (fn) {
      request_.end(fn);
    }

    return request_;
  };
}

Agent.prototype.del = Agent.prototype.delete;

// create a Proxy that can instantiate a new Agent without using `new` keyword
// (for backward compatibility and chaining)
const proxyAgent = new Proxy(Agent, {
  apply (target, thisArg, argumentsList) {
    return new target(...argumentsList);
  }
});

module.exports = proxyAgent;
