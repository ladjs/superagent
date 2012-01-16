
/**
 * Module dependencies.
 */

var parse = require('url').parse;

/**
 * Expose `CookieJar`.
 */

exports = module.exports = CookieJar;

/**
 * Initialize a new `CookieJar`.
 *
 * @api private
 */

function CookieJar() {
  this.cookies = [];
};

/**
 * Add the given `cookie` to the jar.
 *
 * @param {Cookie} cookie
 * @api private
 */

CookieJar.prototype.add = function(cookie){
  this.cookies = this.cookies.filter(function(c){
    // Avoid duplication (same path, same name)
    return !(c.name == cookie.name && c.path == cookie.path);
  });
  this.cookies.push(cookie);
};

/**
 * Get cookie with the given `name`.
 *
 * @param {String} name
 * @return {Cookie}
 * @api private
 */

CookieJar.prototype.get = function(name){
  return this.cookies.filter(function(cookie){
    return name == cookie.name;
  }).shift();
};

/**
 * Get cookies for the given `url`.
 *
 * @param {String} url
 * @return {Array}
 * @api private
 */

CookieJar.prototype.find = function(url){
  var path = parse(url).pathname
    , now = new Date
    , specificity = {};
  return this.cookies.filter(function(cookie){
    if (0 == path.indexOf(cookie.path) && now < cookie.expires
      && cookie.path.length > (specificity[cookie.name] || 0))
      return specificity[cookie.name] = cookie.path.length;
  });
};

/**
 * Return Cookie string for the given `url`.
 *
 * @param {String} url
 * @return {String}
 * @api private
 */

CookieJar.prototype.cookieString = function(url){
  var cookies = this.get(url);
  if (cookies.length) {
    return cookies.map(function(cookie){
      return cookie.name + '=' + cookie.value;
    }).join('; ');
  }
};