
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