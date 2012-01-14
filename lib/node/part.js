
/*!
 * superagent - Part
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils')
  , Stream = require('stream').Stream;

/**
 * Expose `Part`.
 */

module.exports = Part;

/**
 * Initialize a new `Part` for the given `req`.
 *
 * @param {Request} req
 * @api public
 */

function Part(req) {
  this.req = req;
  this.header = {};
  this.headerSent = false;
  this.request = req.request();
  this.writable = true;
  if (!req._boundary) this.assignBoundary();
}

/**
 * Inherit from `Stream.prototype`.
 */

Part.prototype.__proto__ = Stream.prototype;

/**
 * Assign the initial request-level boundary.
 *
 * @api private
 */

Part.prototype.assignBoundary = function(){
  var boundary = utils.uid(32);
  this.req.set('Content-Type', 'multipart/form-data; boundary="' + boundary + '"');
  this.req._boundary = boundary;
};

/**
 * Set header `field` to `val`.
 *
 * @param {String} field
 * @param {String} val
 * @return {Part} for chaining
 * @api public
 */

Part.prototype.set = function(field, val){
  if (!this._boundary) {
    this.request.write('\r\n--' + this.req._boundary + '\r\n');
    this._boundary = true;
  }
  this.request.write(field + ': ' + val + '\r\n');
  return this;
};

/**
 * Write `data` with `encoding`.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @return {Boolean}
 * @api public
 */

Part.prototype.write = function(data, encoding){
  if (!this._headerCRLF) {
    this.request.write('\r\n');
    this._headerCRLF = true;
  }
  return this.request.write(data, encoding);
};

/**
 * Return a new `Part`.
 *
 * @return {Part}
 * @api public
 */

Part.prototype.part = function(){
  return this.req.part();
};

/**
 * End the request.
 *
 * @return {Request}
 * @api public
 */

Part.prototype.end = function(fn){
  return this.req.end(fn);
};