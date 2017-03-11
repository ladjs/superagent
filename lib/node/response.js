
/**
 * Module dependencies.
 */

var util = require('util');
var Stream = require('stream');
var ResponseBase = require('../response-base');

/**
 * Expose `Response`.
 */

function noop(){}

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

function Response(req) {
  Stream.call(this);
  var res = this.res = req.res;
  this.dataEmitter = this.emit.bind(this, 'data');
  this.ender = this.onResEnd.bind(this);
  this.closer = this.onResClose.bind(this);
  this.errorer = this.onResError.bind(this);
  this.request = req;
  this.req = req.req;
  this.text = res.text;
  this.body = res.body !== undefined ? res.body : {};
  this.files = res.files || {};
  this.buffered = 'string' == typeof this.text;
  this.header = this.headers = res.headers;
  this._setStatusProperties(res.statusCode);
  this._setHeaderProperties(this.header);
  this.setEncoding = res.setEncoding.bind(res);
  res.on('data', this.dataEmitter);
  res.on('end', this.ender);
  res.on('close', this.closer);
  res.on('error', this.errorer);
  res.on('finish', this.ender);
  res.on('aborted', this.ender);
}

/**
 * Inherit from `Stream`.
 */

util.inherits(Response, Stream);
ResponseBase(Response.prototype);

Response.prototype._cleanUp = function () {
  if (this.res) {
    if (this.dataEmitter) {
      this.res.removeListener('data', this.dataEmitter);
    }
    if (this.ender) {
      this.res.removeListener('end', this.ender);
      this.res.removeListener('aborted', this.ender);
      this.res.removeListener('finish', this.ender);
    }
    if (this.closer) {
      this.res.removeListener('close', this.closer);
    }
    if (this.errorer) {
      this.res.removeListener('error', this.errorer);
    }
  }
  this.setEncoding = noop;
  this.header = null;
  this.buffered = null;
  this.files = null;
  this.body = null;
  this.text = null;
  this.req = null;
  this.request = null;
  this.errorer = null;
  this.closer = null;
  this.ender = null;
  this.dataEmitter = null;
  this.res = null;
};

Response.prototype.onResEnd = function () {
  this.emit('end');
  this._cleanUp();
};

Response.prototype.onResClose = function () {
  this.emit('close');
  this._cleanUp();
};

Response.prototype.onResError = function (error) {
  this.emit('error', error);
  this._cleanUp();
};

/**
 * Implements methods of a `ReadableStream`
 */

Response.prototype.destroy = function(err){
  this._cleanUp();
  ReadableStream.prototype.destroy.call(this);
};

/**
 * Pause.
 */

Response.prototype.pause = function(){
  this.res.pause();
};

/**
 * Resume.
 */

Response.prototype.resume = function(){
  this.res.resume();
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var path = req.path;

  var msg = 'cannot ' + method + ' ' + path + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.text = this.text;
  err.method = method;
  err.path = path;

  return err;
};


Response.prototype.setStatusProperties = function(status){
  console.warn("In superagent 2.x setStatusProperties is a private method");
  return this._setStatusProperties(status);
};

/**
 * To json.
 *
 * @return {Object}
 * @api public
 */

Response.prototype.toJSON = function(){
  return {
    req: this.request.toJSON(),
    header: this.header,
    status: this.status,
    text: this.text
  };
};
