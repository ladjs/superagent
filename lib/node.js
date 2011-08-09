
/*!
 * superagent
 * Copyright (c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , parse = require('url').parse
  , http = require('http')
  , https = require('https');

/**
 * Expose the request function.
 */

exports = module.exports = request;

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Noop.
 */

var noop = function(){};

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return '[object Object]' == toString.call(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 exports.serializeObject = serialize;

/**
 * Parse the given x-www-form-urlencoded `str`.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseString(str) {
  var obj = {}
    , pairs = str.split('&')
    , parts
    , pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

exports.parseString = parseString;

/**
 * Default MIME type map.
 * 
 *     superagent.types.xml = 'application/xml';
 * 
 */

exports.types = {
    html: 'text/html'
  , json: 'application/json'
  , urlencoded: 'application/x-www-form-urlencoded'
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
     'application/x-www-form-urlencoded': serialize
   , 'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  * 
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  * 
  */

exports.parse = {
    'application/x-www-form-urlencoded': parseString
  , 'application/json': JSON.parse
};

/**
 * Initialize a new `Response` with the given node `res` object.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .data({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {ServerResponse} res
 * @param {Object} options
 * @api private
 */

function Response(res, options) {
  options = options || {};
  this.res = res;
  this.text = res.text;
  this.setStatusProperties(res.statusCode);
  this.header = res.headers;
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
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
  var params = (this.header['content-type'] || '').split(/ *; */);
  this.contentType = params.shift();
  this.setParams(params);
};

/**
 * Create properties from `params`.
 *
 * For example "Content-Type: text/plain; charset=utf-8"
 * would provide `.charset` "utf-8".
 *
 * @param {Array} params
 * @api private
 */

Response.prototype.setParams = function(params){
  var param;
  for (var i = 0, len = params.length; i < len; ++i) {
    param = params[i].split(/ *= */);
    this[param[0]] = param[1];
  }
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = exports.parse[this.contentType];
  return parse
    ? parse(str)
    : null;
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
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = 4 == type || 5 == type;

  // sugar
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
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  EventEmitter.call(this);
  this.method = method;
  this.url = url;
  this.header = {};
  this.set('X-Requested-With', 'XMLHttpRequest');
  this.on('end', function(){
    self.callback(new Response(self.res));
  });
}

/**
 * Inherit from `EventEmitter.prototype`.
 */

Request.prototype.__proto__ = EventEmitter.prototype;

/**
 * Set header `field` to `val`.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 * @param {String} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  this.header[field.toLowerCase()] = val;
  return this;
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
 *        .data(xmlstring)
 *        .end(callback);
 *      
 *      request.post('/')
 *        .type('application/xml')
 *        .data(xmlstring)
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
 *         .data('{"name":"tj"})
 *         .end(callback)
 *       
 *       // auto json
 *       request.post('/user')
 *         .data({ name: 'tj' })
 *         .end(callback)
 *       
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('urlencoded')
 *         .data('name=tj')
 *         .end(callback)
 *       
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('urlencoded')
 *         .data({ name: 'tj' })
 *         .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.data = function(data){
  this._data = data;
  if (isObject(data) && !this.header['content-type']) this.type('json');
  return this;
};

/**
 * Send `.data()` and `.end()` with optional callback `fn`.
 *
 * Examples:
 *
 *       // equivalent to .end()
 *       request.post('/user').send();
 *       
 *       // equivalent to .data(user).end()
 *       request.post('/user').send(user);
 *       
 *       // equivalent to .data(user).end(callback)
 *       request.post('/user').send(user, callback);
 *       
 *       // equivalent to ..end(callback)
 *       request.post('/user').send(callback);
 *
 * @param {Object|String} data
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data, fn){
  if ('function' == typeof data) {
    this.end(data);
  } else if (data) {
    this.data(data).end(fn);
  } else {
    this.end();
  }
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this
    , data = this._data || null
    , url = parse(this.url)
    , text = '';

  // store callback
  this.callback = fn || noop;

  // initiate request
  var req = this.req = http.request({
      host: url.hostname
    , port: url.port ? parseInt(url.port, 10) : 80
    , path: url.pathname
    , method: this.method
    , headers: this.header
  });

  // emit "end"
  req.on('response', function(res){
    self.res = res;
    res.setEncoding('utf8');
    res.on('data', function(chunk){ text += chunk; });
    res.on('end', function(){
      res.text = text;
      self.emit('end');
    });
  });

  // serialize stuff
  var serialize = exports.serialize[this.header['content-type']];
  if (serialize) data = serialize(data);

  // content-length
  if (null != data && !this.header['content-length']) {
    this.set('Content-Length', data.length);
  }

  // send stuff
  if (null != data) this.write(data);

  req.end();
  return this;
};

/**
 * Expose `Request`.
 */

exports.Request = Request;

/**
 * Shortcut for `new Request(method, url)`.
 *
 * @param {String} method
 * @param {String} url
 * @return {Request}
 * @api public
 */

function request(method, url) {
  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
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
 * DELETE `url` with optional callback `fn(res)`.
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
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if (data) req.data(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if (data) req.data(data);
  if (fn) req.end(fn);
  return req;
};
