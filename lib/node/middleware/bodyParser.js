/**
 * Module dependencies
 */
var utils = require("../utils")
  , formidable = require("formidable")
  , parsers = require("../parsers");

/**
 * Parse response body middleware
 *
 * @return {Function}
 * @api public
 */
module.exports = function bodyParser() {

  return function bodyParser(req, next) {
    next(null, function bodyParser(res, prev) {
      var mime = utils.type(res.headers['content-type'] || '')
        , type = mime.split('/')
        , subtype = type[1]
        , type = type[0]
        , multipart = 'multipart' == type;

      res.buffered = req._buffer;

      // zlib support
      if (/^(deflate|gzip)$/.test(res.headers['content-encoding'])) {
        utils.unzip(res, res);
      }

      if (multipart) {
        var form = new formidable.IncomingForm;

        form.parse(res.res, function(err, fields, files){
          if (err) return prev(err);
          // TODO: emit formidable events, parse json etc
          res.buffered = false;
          res.body = fields;
          res.files = files;
          req.emit('end');
          req.callback(null, res);
        });
        return;
      }

      // by default only buffer text/*, json
      // and messed up thing from hell
      var text = isText(mime);
      if (null == res.buffered && text) res.buffered = true;

      // parser
      var parse = 'text' == type
        ? parsers.text
        : parsers[mime];

      // buffered response
      if (res.buffered) parse = parse || parsers.text;

      // explicit parser
      if (req._parser) parse = req._parser;

      // parse
      if (parse) {
        parse(res, function(err, obj){
          if(err) return prev(err);
          res.body = obj;
          prev();
        });
      }
      else {
        res.buffered = false;
        prev();
      }
    });
  };
};

/**
 * Check if `mime` is text and should be buffered.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isText(mime) {
  var parts = mime.split('/');
  var type = parts[0];
  var subtype = parts[1];

  return 'text' == type
    || 'json' == subtype
    || 'x-www-form-urlencoded' == subtype;
}
