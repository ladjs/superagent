
/**
 * Module dependencies.
 */

var parse = require('url').parse;

/**
 * Expose `Cookie`.
 */

exports = module.exports = Cookie;

/**
 * Initialize a new `Cookie` with the given cookie `str` and `url`.
 *
 * @param {String} str
 * @param {String} url
 * @api private
 */

function Cookie(str, url) {
  this.str = str;

  // First key is the name
  this.name = str.substr(0, str.indexOf('='));

  // Map the key/val pairs
  str.split(/ *; */).reduce(function(obj, pair){
    pair = pair.split(/ *= */);
    obj[pair[0]] = pair[1] || true;
    return obj;
  }, this);

  // Assign value
  this.value = this[this.name];

  // Expires
  this.expires = this.expires
    ? new Date(this.expires)
    : Infinity;

  // Default or trim path
  this.path = this.path
    ? this.path.trim()
    : parse(url).pathname;
};

/**
 * Return the original cookie string.
 *
 * @return {String}
 * @api public
 */

Cookie.prototype.toString = function(){
  return this.str;
};