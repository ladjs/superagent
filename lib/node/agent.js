
/**
 * Module dependencies.
 */

var CookieJar = require('cookiejar').CookieJar
  , CookieAccess = require('cookiejar').CookieAccessInfo
  , parse = require('url').parse
  , request = require('./index')
  , methods = require('methods');

/**
 * Expose `Agent`.
 */

module.exports = Agent;

/**
 * Initialize a new `Agent`.
 *
 * @api public
 */

function Agent() {
  if (!(this instanceof Agent)) return new Agent;
  this.jar = new CookieJar;
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

// generate HTTP verb methods

methods.forEach(function(method){
  var name = 'delete' == method ? 'del' : method;

  method = method.toUpperCase();
  Agent.prototype[name] = function(url, fn){
    var self = this;
    var req = request(method, url);

    req.on('response', this.saveCookies.bind(this));
    req.on('redirect', this.saveCookies.bind(this));
    req.on('redirect', function(res) {
      attachCookies(req);
    });
    attachCookies();

    // Attach cookies from cookie jar to request
    function attachCookies() {
      var pUrl = parse(req.url);
      var access = CookieAccess(pUrl.host, pUrl.pathname);
      var cookies = self.jar.getCookies(access).toValueString();
      req.cookies = cookies;
    }

    // End request immediately if callback provided
    fn && req.end(fn);

    return req;
  };
});
