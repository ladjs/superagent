
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
  while (len--) {
    buf += chars[Math.random() * nchars | 0];
  }
  return buf;
};
