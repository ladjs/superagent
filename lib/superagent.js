
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
 * Options:
 * 
 *   - `redirects`   maximum number of redirects. [5]
 *
 * @param {Object} options
 * @api public
 */

function SuperAgent(options) {
  Agent.call(this, options);
  this.redirects = 'number' == typeof options.redirects
    ? options.redirects
    : 5;
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
  req.agent = this;
  req.options = options;
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
  this.redirects = 0;
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
 * Redirect to `url`.
 *
 * @param {String} url
 * @api private
 */

Request.prototype.redirect = function(url){
  var agent = this.agent;

  this.emit('redirect', url);

  // exceeded
  if (this.redirects++ == agent.redirects) {
    this.emit('error', new Error('exceeded maximum of ' + agent.redirects + ' redirects'));
    return;
  }

  // absolute
  if (~url.indexOf('://')) {
    url = parse(url);
  // relative
  } else {
    // TODO: qs
    url = {
        port: this.options.port
      , hostname: this.options.host
      , pathname: url
    };
  }

  var req = agent.appendMessage({
      method: this.options.method
    , host: url.hostname
    , port: url.port
    , path: url.pathname + (url.search || '')
  });

  req.redirects = this.redirects;
  req._events = this._events;
  req.end();
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
  // TODO: pool
  var agent = new SuperAgent(options);

  // request
  var req = agent.appendMessage(options);

  req.on('response', function(res){
    var contentType = res.headers['content-type']
      , status = res.statusCode
      , method = res.method
      , location
      , parse
      , type;

    // redirect
    if (status >= 300 && status < 400 && 'POST' != method && 'PUT' != method) {
      return req.redirect(res.headers.location);
    }

    // content-type
    if (contentType) {
      contentType = contentType.split(';')[0];
      type = contentType.split('/')[0] + '/*';
      parse = parsers[contentType] || parsers[type];
    }

    // buffered parse
    if (req._buffer && contentType && parse) {
      res.body = '';

      res.on('data', function(chunk){
        res.body += chunk;
      });

      res.on('end', function(){
        try {
          res.body = parse(res.body);
        } catch (err) {
          res.emit('error', err);
        }
      });
    }

    // response
    req.emit('superagent response', res);
  });

  // prevent subsequent "response" handlers
  // register them for SA responses
  process.nextTick(function(){
    var response = req._events.response;
    if (Array.isArray(response)) {
      req._events.response = response[0];
      req._events['superagent response'] = response.slice(1);
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