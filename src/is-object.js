/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(object) {
  return object !== null && typeof object === 'object';
}

module.exports = isObject;
