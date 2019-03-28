"use strict";

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */
exports.type = str => str.split(/ *; */).shift();
/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.params = str => str.split(/ *; */).reduce((obj, str) => {
  const parts = str.split(/ *= */);
  const key = parts.shift();
  const val = parts.shift();
  if (key && val) obj[key] = val;
  return obj;
}, {});
/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */


exports.parseLinks = str => str.split(/ *, */).reduce((obj, str) => {
  const parts = str.split(/ *; */);
  const url = parts[0].slice(1, -1);
  const rel = parts[1].split(/ *= */)[1].slice(1, -1);
  obj[rel] = url;
  return obj;
}, {});
/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */


exports.cleanHeader = (header, changesOrigin) => {
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header.host; // secuirty

  if (changesOrigin) {
    delete header.authorization;
    delete header.cookie;
  }

  return header;
};