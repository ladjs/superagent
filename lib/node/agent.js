var CookieJar = require('cookiejar').CookieJar
  , CookieAccess = require('cookiejar').CookieAccessInfo
  , parse = require('url').parse
  , request = require('./index')
  , methods = require('methods');

/**
 * Expose `agent`.
 */

module.exports = agent;

// Creates a new Agent

function agent() {
  return new Agent();
}

// A stateful representation of request

function Agent() {
  this.jar = new CookieJar();
}

// generate HTTP verb methods

methods.forEach(function(method){
  var name = ('delete' === method) ? 'del' : method;

  method = method.toUpperCase();
  Agent.prototype[name] = function(url, fn){
    var self = this;
    var req = request(method, url);

    req.on('response', saveCookies);
    req.on('redirect', function(res) {
      saveCookies(res);
      attachCookies(req);
    });
    attachCookies();

    // Save response cookies to cookie jar
    function saveCookies(res) {
      var cookies = res.headers['set-cookie'];
      cookies && self.jar.setCookies(cookies);
    }

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
