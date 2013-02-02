/**
 * Module dependencies
 */
var utils = require("../utils");

/**
 * Handle redirects
 *
 * @return {Function}
 * @api public
 */
module.exports = function redirect() {

  return function redirect(req, next) {
    next(null, function redirect(res, prev) {
      var max = req._maxRedirects
        , redirect = isRedirect(res.statusCode);

      // console.log(redirect)

      req._redirects = typeof req._redirects === "undefined" ? 0 : req._redirects;
      req._redirectList = req._redirectList || [];
      res.redirects = req._redirectList;

      // redirect
      if (redirect) {
        if (req._redirects++ === max) return prev();
        return performRedirect(req, res);
      }

      prev();
    });
  };
};

/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */

function performRedirect(req, res){
  var url = res.headers.location;

  // location
  if (!~url.indexOf('://')) {
    if (0 != url.indexOf('//')) {
      url = '//' + req.host + url;
    }
    url = req.protocol + url;
  }

  // strip Content-* related fields
  // in case of POST etc
  var header = utils.cleanHeader(req.req._headers);
  delete req.req;

  // force GET
  req.method = 'HEAD' == req.method
    ? 'HEAD'
    : 'GET';

  // redirect
  req._data = null;
  req.url = url;
  req._redirectList.push(url);
  req.emit('redirect', res);
  req.set(header);
  req.end(req._callback);
  return req;
};

/**
 * Check if we should follow the redirect `code`.
 *
 * @param {Number} code
 * @return {Boolean}
 * @api private
 */

function isRedirect(code) {
  return ~[301, 302, 303, 305, 307].indexOf(code);
}
