/*!
 * superagent
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Stream = require('stream').Stream
  , formidable = require('formidable')
  , Response = require('./response')
  , parse = require('url').parse
  , format = require('url').format
  , methods = require('methods')
  , utils = require('./utils')
  , Part = require('./part')
  , mime = require('mime')
  , https = require('https')
  , http = require('http')
  , fs = require('fs')
  , qs = require('qs')
  , util = require('util');

/**
 * Expose the request function.
 */

exports = module.exports = request;

/**
 * Expose the agent function
 */

exports.agent = require('./agent');


/**
 * Expose `Part`.
 */

exports.Part = Part;

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `Response`.
 */

exports.Response = Response;

/**
 * Define "form" mime type.
 */

mime.define({
  'application/x-www-form-urlencoded': ['form', 'urlencoded', 'form-data']
});

/**
 * Protocol map.
 */

exports.protocols = {
  'http:': http,
  'https:': https
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
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

exports.serialize = {
  'application/x-www-form-urlencoded': qs.stringify,
  'application/json': JSON.stringify
};

/**
 * Default parsers.
 *
 *     superagent.parse['application/xml'] = function(res, fn){
 *       fn(null, result);
 *     };
 *
 */

exports.parse = require('./parsers');

/**
 * Default middleware
 */
exports.middleware = [
  require("./middleware/redirect")(),
  require("./middleware/bodyParser")()
];

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  if ('string' != typeof url) url = format(url);
  this.method = method;
  this.url = url;
  this.header = {};
  this.writable = true;
  this.redirects(5);
  this.attachments = [];
  this.cookies = '';
  this.stacks = {req:[], res:[]};
  this.on('end', this.clearTimeout.bind(this));
  this.on('response', function(res){
    self.callback(null, res);
  });

  // Default middleware
  for (var i = 0; i < exports.middleware.length; i++) {
    this.use(exports.middleware[i]);
  };
}

/**
 * Inherit from `Stream.prototype`.
 */

Request.prototype.__proto__ = Stream.prototype;

/**
 * Queue the given `file` as an attachment
 * with optional `filename`.
 *
 * @param {String} field
 * @param {String} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this.attachments.push({
    field: field,
    path: file,
    part: new Part(this),
    filename: filename || file
  });
  return this;
};

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
 * Set _Content-Type_ response header passed through `mime.lookup()`.
 *
 * Examples:
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/json')
 *        .send(jsonstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  return this.set('Content-Type', ~type.indexOf('/')
    ? type
    : mime.lookup(type));
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  var req = this.request();
  if ('string' != typeof val) val = qs.stringify(val);
  if (!val.length) return this;
  req.path += (~req.path.indexOf('?') ? '&' : '?') + val;
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
 *         .send('{"name":"tj"}')
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
 *       // string defaults to x-www-form-urlencoded
 *       request.post('/user')
 *         .send('name=tj')
 *         .send('foo=bar')
 *         .send('bar=baz')
 *         .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var req = this.request();
  var type = req.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  // string
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = req.getHeader('Content-Type');

    // concat &
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;

  // default to json
  if (!type) this.type('json');
  return this;
};

/**
 * Use middleware for manipulating req/res.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api public
 */
Request.prototype.use = function(fn) {
  this.stacks.req.push({handle: fn});
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
 * @return {Stream}
 * @api public
 */

Request.prototype.pipe = function(stream, options){
  this.buffer(false);
  this.end().req.on('response', function(res){
    res.pipe(stream, options);
  });
  return stream;
};

/**
 * Enable / disable buffering.
 *
 * @return {Boolean} [val]
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.buffer = function(val){
  this._buffer = false === val
    ? false
    : true;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Define the parser to be used for this response.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.parse = function(fn){
  this._parser = fn;
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
 * Write the field `name` and `val`.
 *
 * @param {String} name
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  this.part()
    .name(name)
    .write(val);
  return this;
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
    , options = {}
    , data = this._data
    , url = this.url;

  // default to http://
  if (0 != url.indexOf('http')) url = 'http://' + url;
  url = parse(url, true);

  // options
  options.method = this.method;
  options.port = url.port;
  options.path = url.pathname;
  options.host = url.hostname;

  // initiate request
  var mod = exports.protocols[url.protocol];

  // request
  var req = this.req = mod.request(options);
  req.setHeader('Accept-Encoding', 'gzip, deflate');
  this.protocol = url.protocol;
  this.host = url.host;

  // expose events
  req.on('drain', function(){ self.emit('drain'); });

  req.on('error', function(err){
    // flag abortion here for out timeouts
    // because node will emit a faux-error "socket hang up"
    // when request is aborted before a connection is made
    if (self._aborted) return;
    self.callback(err);
  });

  // auth
  if (url.auth) {
    var auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  // query
  this.query(url.query);

  // add cookies
  req.setHeader('Cookie', this.cookies);

  return req;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Handle requests, punting them down
 * the middleware stack.
 *
 * @param {Request} req
 * @param {Function} out
 * @param {Boolean} resp
 * @api private
 */

Request.prototype.handle = function(req, out, resp) {
  var stack
    , self = this
    , index = 0
    , resp = !!resp;

  if(resp) {
    stack = self.stacks.res;
    index = stack.length-1;
  }
  else {
    self.stacks.res = [];
    stack = self.stacks.req;
  }

  function next(err, prev) {

    // Add the res callback to the stack
    if(prev && !resp) self.stacks.res.push({handle: prev});

    var layer, status, c;

    // next callback
    layer = resp ? stack[index--] : stack[index++];

    // all done
    if (!layer) {
      // delegate to parent
      if (out) return out(err);
      return;
    }

    try {
      var arity = layer.handle.length;
      if (err) {
        if (arity === 3) {
          layer.handle(err, req, next);
        } else {
          next(err);
        }
      } else if (arity < 3) {
        layer.handle(req, next);
      } else {
        next();
      }
    } catch (e) {
      next(e);
    }
  }
  next();
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
    , req = self.request();

  this.handle(self, function(err) {
    var data = self._data
      , method = self.method
      , timeout = self._timeout;

    // store callback
    self._callback = fn || noop;

    var abort = function(err) {
      self._aborted = true;
      req.abort();
      self.callback(err);
    };

    if(err) return abort(err);

    // timeout
    if (timeout && !self._timer) {
      self._timer = setTimeout(function(){
        var err = new Error('timeout of ' + timeout + 'ms exceeded');
        err.timeout = timeout;
        abort(err);
      }, timeout);
    }

    // body
    if ('HEAD' != method && !req._headerSent) {
      // serialize stuff
      if ('string' != typeof data) {
        var serialize = exports.serialize[req.getHeader('Content-Type')];
        if (serialize) data = serialize(data);
      }

      // content-length
      if (data && !req.getHeader('Content-Length')) {
        self.set('Content-Length', Buffer.byteLength(data));
      }
    }

    // response
    req.on('response', function(res){

      var response = new Response(req, res);
      self.res = res;

      self.handle(response, function(err) {
        // unbuffered
        if (!res.buffered) {
          self.emit('response', response);
          return;
        }

        res.on('end', function(){
          // TODO: unless buffering emit earlier to stream
          self.emit('response', response);
          self.emit('end');
        });
      }, true);
    });

    if (self.attachments.length) return self.writeAttachments();

    // multi-part boundary
    if (self._boundary) self.writeFinalBoundary();

    req.end(data);

  });

  return this;
};

/**
 * Write the final boundary.
 *
 * @api private
 */

Request.prototype.writeFinalBoundary = function(){
  this.request().write('\r\n--' + this._boundary + '--');
};

/**
 * Write the attachments in sequence.
 *
 * @api private
 */

Request.prototype.writeAttachments = function(){
  var files = this.attachments
    , req = this.request()
    , self = this;

  function next() {
    var file = files.shift();
    if (!file) {
      self.writeFinalBoundary();
      return req.end();
    }

    file.part.attachment(file.field, file.filename);
    var stream = fs.createReadStream(file.path);

    // TODO: pipe
    // TODO: handle errors
    stream.on('data', function(data){
      file.part.write(data);
    }).on('error', function(err){
      self.emit('error', err);
    }).on('end', next);
  }

  next();
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

// generate HTTP verb methods

methods.forEach(function(method){
  var name = 'delete' == method
    ? 'del'
    : method;

  method = method.toUpperCase();
  request[name] = function(url, fn){
    var req = request(method, url);
    fn && req.end(fn);
    return req;
  };
});