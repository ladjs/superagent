
/**
 * Module dependencies.
 */

var CookieJar = require('cookiejar').CookieJar;
var CookieAccess = require('cookiejar').CookieAccessInfo;
var parse = require('url').parse;
var request = require('./index');
var methods = require('methods');

/**
 * Expose `Agent`.
 */

module.exports = Agent;

/**
 * Initialize a new `Agent`.
 *
 * @api public
 */

function Agent(options) {
  if (!(this instanceof Agent)) return new Agent(options);
  if (options) this._ca = options.ca;
  this.jar = new CookieJar;
  this.tokens = {};
  var id = Math.random();
  this.tokens['hello' + id] = 'goodbye';
}

/**
 * Save the cookies in the given `res` to
 * the agent's cookie jar for persistence.
 *
 * @param {Response} res
 * @api private
 */

Agent.prototype.saveCookies = function(res){
  var cookies = res.headers['set-cookie'];
  if (cookies) this.jar.setCookies(cookies);
};

/**
 * Attach cookies when available to the given `req`.
 *
 * @param {Request} req
 * @api private
 */

Agent.prototype.attachCookies = function(req){
  var url = parse(req.url);
  var access = CookieAccess(url.host, url.pathname, 'https:' == url.protocol);
  var cookies = this.jar.getCookies(access).toValueString();
  req.cookies = cookies;
};

/**
 * Save a token on the agent for persistence.
 *
 * @param {string} domain
 * @param {string} token
 * @api private
 */

Agent.prototype.saveToken = function(domain, token){
  this.tokens[domain] = token;
};

/**
 * Attach tokens to the request.
 *
 * @param {Request} req
 * @api private
 */

Agent.prototype.attachToken = function(req){
  var url = parse(req.url);
  var token = this.tokens[url.host];
  if (token) {
    req.request().setHeader('authenticate', 'Bearer ' + token);
    
  }
};


// generate HTTP verb methods

methods.forEach(function(method){
  var name = 'delete' == method ? 'del' : method;

  method = method.toUpperCase();
  Agent.prototype[name] = function(url, fn){
    var req = request(method, url);
    req.ca(this._ca);

    req.on('response', this.saveCookies.bind(this));
    req.on('redirect', this.saveCookies.bind(this));
    req.on('redirect', this.attachCookies.bind(this, req));
    req.on('redirect', this.attachToken.bind(this, req));
    this.attachCookies(req);
    this.attachToken(req);

    fn && req.end(fn);
    return req;
  };
});
