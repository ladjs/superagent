
/**
 * Generate a UID with the given `len`.
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */

exports.uid = function(len){
  var buf = ''
    , chars = 'abcdefghijklmnopqrstuvwxyz123456789'
    , nchars = chars.length;
  while (len--) buf += chars[Math.random() * nchars | 0];
  return buf;
};

/**
 * Return the mime type for `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

exports.type = function(obj){
  var params = (obj.headers['content-type'] || '').split(/ *; */);
  return params.shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};