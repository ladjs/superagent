
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
  , parsers = require('./parsers')
  , qs = require('querystring') // TODO: replace with 'qs'
  , Agent = http.Agent;

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
  , 'head'
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
 * Options:
 *
 *    - `redirects`   maximum number of redirects. [5]
 *
 * @param {Object} options
 * @param {Number} defaultPort
 * @api private
 */

function Request(options, defaultPort) {
  ClientRequest.call(this, options, defaultPort);
  this.maxRedirects = 'number' == typeof options.redirects
    ? options.redirects
    : 5;
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
 * Write `obj` as x-www-form-urlencoded.
 *
 * @param {Mixed} obj
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.form = function(obj){
  this.header('Content-Type', 'application/x-www-form-urlencoded');
  this.write(qs.stringify(obj));
  return this;
};

/**
 * Write `obj` as JSON.
 *
 * @param {Mixed} obj
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.json = function(obj){
  this.header('Content-Type', 'application/json');
  this.write(JSON.stringify(obj));
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
  if (this.redirects++ == this.maxRedirects) {
    this.emit('error', new Error('exceeded maximum of ' + this.maxRedirects + ' redirects'));
    return;
  }

  // TODO: relatve to scheme
  // absolute
  if (~url.indexOf('://')) {
    url = parse(url);
  // relative
  } else {
    url = {
        port: this.options.port
      , hostname: this.options.host
      , pathname: url
    };
  }

  var req = exports.request(this.options.method, {
      host: url.hostname
    , port: url.port
    , path: url.pathname + (url.search || '')
    , agent: this.agent
  });

  req.redirects = this.redirects;
  req._events = this._events;
  req.end();
};

/**
 * Request `method` with `options`.
 *
 * @param {String} method
 * @param {String|Object} url or options
 * @param {Function} fn* @return {ClientRequest}
 * @api public
 */

exports.request = function(method, options){
  options = options || {};

  // from url.parse()
  if (options.hostname) options = format(options);

  // url
  if ('string' == typeof options) {
    options = urlObjectToRequest(parse(options));
  }

  // http method
  options.method = method;

  // agent
  // TODO: pool
  var agent = options.agent || new SuperAgent(options);

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

    // buffer
    if (req._buffer && contentType && parse) {
      req.buffering = true;
      res.body = '';

      res.on('data', function(chunk){
        res.body += chunk;
      });

      res.on('end', function(){
        try {
          res.body = parse(res.body);
        } catch (err) {
          req.emit('error', err);
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
    var req = exports.request(method, options);
  
    // callback support
    if (fn) {
      function done(err, res, body){
        if (fn.called) return;
        fn.called = true;
        fn(err, res, body);
      };

      req.on('error', done);
      req.on('response', function(res){
        if (req.buffering) {
          res.on('end', function(){
            done(null, res, res.body);
          });
        } else {
          done(null, res);
        }
      }).end();
    }

    return req;
  };
});

/**
 * Return a `url` object to the format
 * expected by request().
 *
 * @param {Object} url
 * @return {Object}
 * @api private
 */

function urlObjectToRequest(url) {
  return {
      host: url.hostname
    , port: url.port
    , path: url.pathname + (url.search || '')
  };
}