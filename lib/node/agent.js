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

    // Save response cookies to cookie jar
    req.on('response', function saveCookies(res) {
      var cookies = res.headers['set-cookie'];
      cookies && self.jar.setCookies(cookies);
    });

    // Attach cookies from cookie jar to request
    var pUrl = parse(url);
    var access = CookieAccess(pUrl.host, pUrl.pathname);
    var cookies = this.jar.getCookies(access).toValueString();
    req.cookies = cookies;

    // End request immediately if callback provided
    fn && req.end(fn);

    return req;
  };
});
