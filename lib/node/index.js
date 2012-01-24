
/*!
 * superagent
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream
  , parse = require('url').parse
  , format = require('url').format
  , utils = require('./utils')
  , Part = require('./part')
  , https = require('https')
  , http = require('http')
  , qs = require('qs');

/**
 * Expose the request function.
 */

exports = module.exports = request;

/**
 * Library version.
 */

exports.version = '0.3.0';

/**
 * Expose `Part`.
 */

exports.Part = Part;

/**
 * Noop.
 */

var noop = function(){};

/**
 * Protocol map.
 */

exports.protocols = {
    'http:': http
  , 'https:': https
};

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

/**
 * Default MIME type map.
 * 
 *     superagent.types.xml = 'application/xml';
 * 
 */

exports.types = {
    html: 'text/html'
  , json: 'application/json'
  , form: 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 * 
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 * 
 */

exports.serialize = {
    'application/x-www-form-urlencoded': qs.stringify
  , 'application/json': JSON.stringify
};

/**
 * Default parsers.
 * 
 *     superagent.parse['application/xml'] = function(req, fn){
 *       fn(null, result);
 *     };
 * 
 */

exports.parse = {
  'application/x-www-form-urlencoded': function(req, fn){
    var buf = '';
    req.setEncoding('ascii');
    req.on('data', function(chunk){ buf += chunk; });
    req.on('end', function(){
      try {
        fn(null, qs.parse(buf));
      } catch (err) {
        fn(err);
      }
    });
  },

  'application/json': function(req, fn){
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ buf += chunk; });
    req.on('end', function(){
      try {
        fn(null, JSON.parse(buf));
      } catch (err) {
        fn(err);
      }
    });
  }
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * @param {ClientRequest} req
 * @param {IncomingMessage} res
 * @param {Object} options
 * @api private
 */

function Response(req, res, options) {
  options = options || {};
  this.req = req;
  this.res = res;
  this.text = res.text;
  this.body = res.body;
  this.header = this.headers = res.headers;
  this.setStatusProperties(res.statusCode);
  this.setHeaderProperties(this.header);
}

/**
 * Set header related properties:
 *
 *   - `.contentType` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.contentType` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // TODO: moar!
  // TODO: make this a util

  // content-type
  var ct = this.header['content-type'] || '';
  this.type = utils.type(ct);

  // params
  var params = utils.params(ct);
  for (var key in params) this[key] = params[key];
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.redirect = 3 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = 4 == type || 5 == type;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
};

/**
 * Expose `Response`.
 */

exports.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  if ('string' != url) url = format(url);
  this.method = method;
  this.url = url;
  this.header = {};
  this.writable = true;
  this._redirects = 0;
  this.redirects(5);
  this._buffer = true;
  this.on('end', function(){
    self.callback(new Response(self.req, self.res));
  });
}

/**
 * Inherit from `Stream.prototype`.
 */

Request.prototype.__proto__ = Stream.prototype;

/**
 * Set the max redirects to `n`.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Return a new `Part` for this request.
 *
 * @return {Part}
 * @api public
 */

Request.prototype.part = function(){
  return new Part(this);
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this.request().setHeader(field, val);
  return this;
};

/**
 * Get request header `field`.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Request.prototype.get = function(field){
  return this.request().getHeader(field);
};

/**
 * Set Content-Type to `type`, mapping values from `exports.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *      
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', exports.types[type] || type);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *       
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *       
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *       
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else {
    this._data = data;
  }

  if ('GET' == this.method) return this;
  if (!obj) return this;
  if (this.request().getHeader('Content-Type')) return this;
  this.type('json');
  return this;
};

/**
 * Write raw `data` / `encoding` to the socket.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @return {Boolean}
 * @api public
 */

Request.prototype.write = function(data, encoding){
  return this.request().write(data, encoding);
};

/**
 * Pipe the request body to `stream`.
 *
 * @param {Stream} stream
 * @param {Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.pipe = function(stream, options){
  this.preventBuffer();
  return this.end().on('response', function(res){
    res.pipe(stream, options);
  });
};

/**
 * Prevent buffering.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.preventBuffer = function(){
  this._buffer = false;
  return this;
};

/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */

Request.prototype.redirect = function(res){
  var url = res.headers.location;
  delete this.req;
  this.emit('redirect', res);
  this.url = url;
  this.end(this.callback);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = new Buffer(user + ':' + pass).toString('base64');
  return this.set('Authorization', 'Basic ' + str);
};

/**
 * Return an http[s] request.
 *
 * @return {OutgoingMessage}
 * @api private
 */

Request.prototype.request = function(){
  if (this.req) return this.req;
  var self = this
    , options = this.options || {}
    , data = this._data || null
    , url = this.url;

  // default to http://
  if (0 != url.indexOf('http')) url = 'http://' + url;
  url = parse(url);

  // options
  options.method = this.method;
  options.port = url.port;
  options.path = url.pathname;
  options.host = url.hostname;

  // querystring
  if ('GET' == this.method && null != data) {
    options.path += '?' + qs.stringify(data);
    data = null;
  }

  // initiate request
  var mod = exports.protocols[url.protocol];

  // request
  var req = this.req = mod.request(options);

  // expose events
  req.on('drain', function(){ self.emit('drain'); });
  req.on('error', function(err){ self.emit('error', err); });

  // auth
  if (url.auth) {
    var auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  return req;
};

/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this
    , data = this._data || null
    , req = this.request()
    , buffer = this._buffer;

  // store callback
  this.callback = fn || noop;

  // body
  if ('GET' == this.method || 'HEAD' == this.method) {
    data = null;
  } else if (!req._headerSent) {
    // serialize stuff
    var serialize = exports.serialize[req.getHeader('Content-Type')];
    if (serialize) data = serialize(data);

    // content-length
    if (null != data && !req.getHeader('Content-Length')) {
      this.set('Content-Length', data.length);
    }
  }

  // multi-part boundary
  if (this._boundary) {
    req.write('\r\n--' + this._boundary + '--');
  }

  // response
  req.on('response', function(res){
    var max = self._maxRedirects;

    // redirect
    if (3 == (res.statusCode / 100 | 0)) {
      if (self._redirects++ != max) return self.redirect(res);
    }

    // response event
    self.emit('response', res);

    // zlib support
    if (/^(deflate|gzip)$/.test(res.headers['content-encoding'])) {
      utils.unzip(res);
    }

    // buffered response
    // TODO: optional
    if (buffer) {
      res.text = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk){ res.text += chunk; });
    }

    // parser
    var parse = exports.parse[utils.type(res.headers['content-type'] || '')];
    if (parse) {
      parse(res, function(err, obj){
        // TODO: handle error
        res.body = obj;
      });
    }

    // end event
    self.res = res;
    res.on('end', function(){ self.emit('end'); });
  });

  req.end(data);
  return this;
};

/**
 * Expose `Request`.
 */

exports.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(err, res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, fn){
  var req = request('GET', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(err, res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(err, res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(err, res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};
