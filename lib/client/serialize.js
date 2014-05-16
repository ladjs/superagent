var isObject = require('./isObject');

/**
 * Serialize the given `obj` using uri encoding.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

module.exports = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
};

module.exports.json = JSON.stringify;
module.exports.urlencoded = serialize;
