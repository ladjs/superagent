
/*!
 * superagent
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse
  , format = require('url').format
  , http = require('http')
  , ClientRequest = http.ClientRequest
  , Agent = http.Agent
  , parsers = require('./parsers');

/**
 * Expose the constructor.
 */

exports = module.exports = SuperAgent; 

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * HTTP methods supported.
 */

exports.methods = [
    'get'
  , 'post'
  , 'put'
  , 'delete'
  , 'connect'
  , 'options'
  , 'trace'
  , 'copy'
  , 'lock'
  , 'mkcol'
  , 'move'
  , 'propfind'
  , 'proppatch'
  , 'unlock'
  , 'report'
  , 'mkactivity'
  , 'checkout'
  , 'merge'
];

/**
 * Initialize a `SuperAgent` with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

function SuperAgent(options) {
  Agent.call(this, options);
  this.path = options.path;
}

/**
 * Re-implementation of node's appendMessage to
 * support `Request`.
 *
 * @param {Object} options
 * @return {Request}
 * @api public
 */

SuperAgent.prototype.appendMessage = function(options){
  var req = new Request(options, this.defaultPort);
  this.queue.push(req);
  req._queue = this.queue;
  this._cycle();
  return req;
};

/**
 * Inherit from `Agent.prototype`.
 */

SuperAgent.prototype.__proto__ = Agent.prototype;

/**
 * Initialize a new `Request` with the given `options`
 * and `defaultPort`.
 *
 * @param {Object} options
 * @param {Number} defaultPort
 * @api private
 */

function Request(options, defaultPort) {
  ClientRequest.call(this, options, defaultPort);
}

/**
 * Inherit from `ClientRequest.prototype`.
 */

Request.prototype.__proto__ = ClientRequest.prototype;

/**
 * Set header `field` to `val`, or return the
 * value of `field`.
 *
 * @param {String} field
 * @param {String} val
 * @return {Request|String}
 * @api public
 */

Request.prototype.header = function(field, val){
  if (undefined == val) return this.getHeader(field);
  this.setHeader(field, val);
  return this;
};

/**
 * Enable buffering, or disable by passing `false`.
 *
 * @param {Boolean} bool
 * @return {SuperAgent} for chaining
 * @api public
 */

Request.prototype.buffer = function(bool){
  this._buffer = arguments.length
    ? bool
    : true;
  return this;
};

/**
 * Request `method` with `options` and optional callback `fn`.
 *
 * @param {String} method
 * @param {String|Object} url or options
 * @param {Function} fn
 * @return {ClientRequest}
 * @api public
 */

exports.request = function(method, options, fn){
  options = options || {};

  // from url.parse()
  if (options.hostname) options = format(options);

  // url
  if ('string' == typeof options) {
    var url = parse(options);
    options = {
        host: url.hostname
      , port: url.port
      , path: url.pathname + (url.search || '')
    };
  }

  // http method
  options.method = method;

  // agent
  var agent = new SuperAgent(options);

  // request
  var req = agent.appendMessage(options);

  req.on('response', function(res){
    var contentType = res.headers['content-type'];
    if (req._buffer && contentType) {
      contentType = contentType.split(';')[0];
      // TODO: abstract into parsers
      if (0 == contentType.indexOf('text/')
        || 'application/json' == contentType
        || 'application/x-www-form-urlencoded' == contentType) {
        res.body = '';

        res.on('data', function(chunk){
          res.body += chunk;
        });

        if ('application/json' == contentType) {
          res.on('end', function(){
            try {
              res.body = JSON.parse(res.body);
            } catch (err) {
              res.emit('error', err);
            }
          });
        } else if ('application/x-www-form-urlencoded' == contentType) {
          res.on('end', function(){
            try {
              res.body = qs.parse(res.body);
            } catch (err) {
              res.emit('error', err);
            }
          });
        }
      }
    }
  });

  return req;
};

// HTTP methods

exports.methods.forEach(function(method){
  exports[method] = function(options, fn){
    return exports.request(method, options, fn);
  };
});