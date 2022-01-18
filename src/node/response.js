/**
 * Module dependencies.
 */

const util = require('util');
const Stream = require('stream');
const ResponseBase = require('../response-base');
const { mixin } = require('../utils');

/**
 * Expose `Response`.
 */

module.exports = Response;

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * @param {Request} req
 * @param {Object} options
 * @constructor
 * @extends {Stream}
 * @implements {ReadableStream}
 * @api private
 */

function Response(request) {
  Stream.call(this);
  this.res = request.res;
  const { res } = this;
  this.request = request;
  this.req = request.req;
  this.text = res.text;
  this.files = res.files || {};
  this.buffered = request._resBuffered;
  this.headers = res.headers;
  this.header = this.headers;
  this._setStatusProperties(res.statusCode);
  this._setHeaderProperties(this.header);
  this.setEncoding = res.setEncoding.bind(res);
  res.on('data', this.emit.bind(this, 'data'));
  res.on('end', this.emit.bind(this, 'end'));
  res.on('close', this.emit.bind(this, 'close'));
  res.on('error', this.emit.bind(this, 'error'));
}

// Lazy access res.body.
// https://github.com/nodejs/node/pull/39520#issuecomment-889697136
Object.defineProperty(Response.prototype, 'body', {
  get () {
    return this._body !== undefined
      ? this._body
      : this.res.body !== undefined
        ? this.res.body
        : {};
  },
  set (value) {
    this._body = value;
  }
});

/**
 * Inherit from `Stream`.
 */

util.inherits(Response, Stream);

mixin(Response.prototype, ResponseBase.prototype);

/**
 * Implements methods of a `ReadableStream`
 */

Response.prototype.destroy = function (error) {
  this.res.destroy(error);
};

/**
 * Pause.
 */

Response.prototype.pause = function () {
  this.res.pause();
};

/**
 * Resume.
 */

Response.prototype.resume = function () {
  this.res.resume();
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function () {
  const { req } = this;
  const { method } = req;
  const { path } = req;

  const message = `cannot ${method} ${path} (${this.status})`;
  const error = new Error(message);
  error.status = this.status;
  error.text = this.text;
  error.method = method;
  error.path = path;

  return error;
};

Response.prototype.setStatusProperties = function (status) {
  console.warn('In superagent 2.x setStatusProperties is a private method');
  return this._setStatusProperties(status);
};

/**
 * To json.
 *
 * @return {Object}
 * @api public
 */

Response.prototype.toJSON = function () {
  return {
    req: this.request.toJSON(),
    header: this.header,
    status: this.status,
    text: this.text
  };
};
