/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @api private
 */

const querystring = require('querystring');
const { Buffer } = require('safe-buffer');
const contentType = require('content-type');
const { mime } = require('send');
const etag = require('etag');
const proxyaddr = require('proxy-addr');
const qs = require('qs');

let isHttp2Supported = true;

/**
 * Test for http2 support
 * @api private
 */
try {
  require('http2');
} catch {
  isHttp2Supported = false;
}
/**
 * Return strong ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.etag = createETagGenerator({ weak: false });

/**
 * Return weak ETag for `body`.
 *
 * @param {String|Buffer} body
 * @param {String} [encoding]
 * @return {String}
 * @api private
 */

exports.wetag = createETagGenerator({ weak: true });

/**
 * Normalize the given `type`, for example "html" becomes "text/html".
 *
 * @param {String} type
 * @return {Object}
 * @api private
 */

exports.normalizeType = function (type) {
  return ~type.indexOf('/')
    ? acceptParameters(type)
    : { value: mime.lookup(type), params: {} };
};

/**
 * Normalize `types`, for example "html" becomes "text/html".
 *
 * @param {Array} types
 * @return {Array}
 * @api private
 */

exports.normalizeTypes = function (types) {
  const returnValue = [];

  for (const element of types) {
    returnValue.push(exports.normalizeType(element));
  }

  return returnValue;
};

/**
 * Parse accept params `str` returning an
 * object with `.value`, `.quality` and `.params`.
 * also includes `.originalIndex` for stable sorting
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function acceptParameters(string_, index) {
  const parts = string_.split(/ *; */);
  const returnValue = {
    value: parts[0],
    quality: 1,
    params: {},
    originalIndex: index
  };

  for (let i = 1; i < parts.length; ++i) {
    const pms = parts[i].split(/ *= */);
    if (pms[0] === 'q') {
      returnValue.quality = Number.parseFloat(pms[1]);
    } else {
      returnValue.params[pms[0]] = pms[1];
    }
  }

  return returnValue;
}

/**
 * Compile "etag" value to function.
 *
 * @param  {Boolean|String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileETag = function (value) {
  let fn;

  if (typeof value === 'function') {
    return value;
  }

  switch (value) {
    case true:
      fn = exports.wetag;
      break;
    case false:
      break;
    case 'strong':
      fn = exports.etag;
      break;
    case 'weak':
      fn = exports.wetag;
      break;
    default:
      throw new TypeError('unknown value for etag function: ' + value);
  }

  return fn;
};

/**
 * Compile "query parser" value to function.
 *
 * @param  {String|Function} val
 * @return {Function}
 * @api private
 */

exports.compileQueryParser = function compileQueryParser(value) {
  let fn;

  if (typeof value === 'function') {
    return value;
  }

  switch (value) {
    case true:
      fn = querystring.parse;
      break;
    case false:
      break;
    case 'extended':
      fn = parseExtendedQueryString;
      break;
    case 'simple':
      fn = querystring.parse;
      break;
    default:
      throw new TypeError('unknown value for query parser function: ' + value);
  }

  return fn;
};

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} val
 * @return {Function}
 * @api private
 */

exports.compileTrust = function (value) {
  if (typeof value === 'function') return value;

  if (value === true) {
    // Support plain true/false
    return function () {
      return true;
    };
  }

  if (typeof value === 'number') {
    // Support trusting hop count
    return function (a, i) {
      return i < value;
    };
  }

  if (typeof value === 'string') {
    // Support comma-separated values
    value = value.split(/ *, */);
  }

  return proxyaddr.compile(value || []);
};

/**
 * Flag for http2 support
 */
exports.isHttp2Supported = isHttp2Supported;
/**
 * Set the charset in a given Content-Type string.
 *
 * @param {String} type
 * @param {String} charset
 * @return {String}
 * @api private
 */

exports.setCharset = function setCharset(type, charset) {
  if (!type || !charset) {
    return type;
  }

  // parse type
  const parsed = contentType.parse(type);

  // set charset
  parsed.parameters.charset = charset;

  // format type
  return contentType.format(parsed);
};

/**
 * Create an ETag generator function, generating ETags with
 * the given options.
 *
 * @param {object} options
 * @return {function}
 * @private
 */

function createETagGenerator(options) {
  return function generateETag(body, encoding) {
    const buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body;

    return etag(buf, options);
  };
}

/**
 * Parse an extended query string with qs.
 *
 * @return {Object}
 * @private
 */

function parseExtendedQueryString(string_) {
  return qs.parse(string_, {
    allowPrototypes: true
  });
}
