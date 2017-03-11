
/**
 * Module dependencies.
 */

var debug = require('debug')('superagent');
var formidable = require('formidable');
var FormData = require('form-data');
var Response = require('./response');
var parse = require('url').parse;
var format = require('url').format;
var resolve = require('url').resolve;
var methods = require('methods');
var Stream = require('stream');
var utils = require('../utils');
var unzip = require('./unzip').unzip;
var extend = require('extend');
var mime = require('mime');
var https = require('https');
var http = require('http');
var fs = require('fs');
var qs = require('qs');
var zlib = require('zlib');
var util = require('util');
var pkg = require('../../package.json');
var RequestBase = require('../request-base');
var isFunction = require('../is-function');
var shouldRetry = require('../should-retry');

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

/**
 * Expose `Request`.
 */

exports.Request = Request;

/**
 * Expose the agent function
 */

exports.agent = require('./agent');

/**
 * Noop.
 */

function noop(){};
function doRemoveListener(eventemitter, eventname, eventhandler) {
  eventemitter.removeListener(eventname, eventhandler);
  if (eventemitter.listenerCount(eventname) < 1) {
    eventemitter.on(eventname, noop);
  }
}

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
 *       fn(null, res);
 *     };
 *
 */

exports.parse = require('./parsers');

/**
 * Initialize internal header tracking properties on a request instance.
 *
 * @param {Object} req the instance
 * @api private
 */
function _initHeaders(req) {
  var ua = 'node-superagent/' + pkg.version;
  req._header = { // coerces header names to lowercase
    'user-agent': ua
  };
  req.header = { // preserves header name case
    'User-Agent': ua
  };
}

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String|Object} url
 * @api public
 */


function Request(method, url) {
  Stream.call(this);
  if ('string' != typeof url) url = format(url);
  this._agent = false;
  this._formData = null;
  this.method = method;
  this.url = url;
  _initHeaders(this);
  this.writable = true;
  this._redirects = 0;
  this.redirects(method === 'HEAD' ? 0 : 5);
  this.cookies = '';
  this.qs = {};
  this.qsRaw = [];
  this._redirectList = [];
  this._streamRequest = false;
  this._unitRequest = null;
  //this.once('end', this.clearTimeout.bind(this));
}

/**
 * Inherit from `Stream` (which inherits from `EventEmitter`).
 * Mixin `RequestBase`.
 */
util.inherits(Request, Stream);
RequestBase(Request.prototype);

Request.prototype.destroy = function () {
  this.clearTimeout();
  if (this._unitRequest) {
    this._unitRequest.destroy();
  }
  this._unitRequest = null;
  this._streamRequest = null;
  this._redirectList = null;
  this.qsRaw = null;
  this.qs = null;
  this.cookies = null;
  this._redirects = null;
  this.writable = null;
  this.url = null;
  this.method = null;
  if (this._formData) {
    this._formData.removeAllListeners();
  }
  this._formData = null;
  this._agent = null;
  this.removeAllListeners();
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach(new Buffer('<b>Hello world</b>'), 'hello.html')
 *   .end(callback);
 * ```
 *
 * A filename may also be used:
 *
 * ``` js
 * request.post('http://localhost/upload')
 *   .attach('files', 'image.jpg')
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {String|fs.ReadStream|Buffer} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    var o = options || {};
    if ('string' == typeof options) {
      o = { filename: options };
    }

    if ('string' == typeof file) {
      if (!o.filename) o.filename = file;
      debug('creating `fs.ReadStream` instance for file: %s', file);
      file = fs.createReadStream(file);
    } else if (!o.filename && file.path) {
      o.filename = file.path;
    }

    this._getFormData().append(field, file, o);
  }
  return this;
};

Request.prototype._onFormDataError = function (err) {
  this.emit('error', err);
  this.abort();
};

Request.prototype._getFormData = function() {
  if (!this._formData) {
    this._formData = new FormData();
    this._formData.on('error', this._onFormDataError.bind(this));
  }
  return this._formData;
};

/**
 * Gets/sets the `Agent` to use for this HTTP request. The default (if this
 * function is not called) is to opt out of connection pooling (`agent: false`).
 *
 * @param {http.Agent} agent
 * @return {http.Agent}
 * @api public
 */

Request.prototype.agent = function(agent){
  if (!arguments.length) return this._agent;
  this._agent = agent;
  return this;
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
 * Set _Accept_ response header passed through `mime.lookup()`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  return this.set('Accept', ~type.indexOf('/')
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
  if ('string' == typeof val) {
    this.qsRaw.push(val);
    return this;
  }

  extend(this.qs, val);
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
  var req = this.request();
  if (!this._streamRequest) {
    this._streamRequest = true;
  }
  return req.write(data, encoding);
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
  this.piped = true; // HACK...
  this.buffer(false);
  this.end();
  return this._pipeContinue(stream, options);
};

Request.prototype._pipeContinue = function(stream, options){
  if (this._unitRequest) {
    this._unitRequest._pipeContinue(stream, options);
  }
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
  this._buffer = (false !== val);
  return this;
};

/**
 * Redirect to `url
 *
 * @param {IncomingMessage} res
 * @return {Request} for chaining
 * @api private
 */

Request.prototype._redirect = function(res){
  var url = res.headers.location;
  if (!url) {
    return this.callback(new Error('No location header for redirect'), res);
  }

  debug('redirect %s -> %s', this.url, url);

  // location
  url = resolve(this.url, url);

  // ensure the response is being consumed
  // this is required for Node v0.10+
  res.resume();

  var headers = this.req._headers;

  var shouldStripCookie = parse(url).host !== parse(this.url).host;

  // implementation of 302 following defacto standard
  if (res.statusCode == 301 || res.statusCode == 302){
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(this.req._headers, shouldStripCookie);

    // force GET
    this.method = 'HEAD' == this.method
      ? 'HEAD'
      : 'GET';

    // clear data
    this._data = null;
  }
  // 303 is always GET
  if (res.statusCode == 303) {
    // strip Content-* related fields
    // in case of POST etc
    headers = utils.cleanHeader(this.req._headers, shouldStripCookie);

    // force method
    this.method = 'GET';

    // clear data
    this._data = null;
  }
  // 307 preserves method
  // 308 preserves method
  delete headers.host;

  delete this.req;
  delete this._formData;

  // remove all add header except User-Agent
  _initHeaders(this)

  // redirect
  this._endCalled = false;
  this.url = url;
  this.qs = {};
  this.qsRaw = [];
  this.set(headers);
  this.emit('redirect', res);
  this._redirectList.push(this.url);
  this.end(this._callback);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * Examples:
 *
 *   .auth('tobi', 'learnboost')
 *   .auth('tobi:learnboost')
 *   .auth('tobi')
 *   .auth(accessToken, { type: 'bearer' })
 *
 * @param {String} user
 * @param {String} [pass]
 * @param {Object} [options] options with authorization type 'basic' or 'bearer' ('basic' is default)
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (1 === arguments.length) pass = '';
  if (2 === arguments.length && typeof pass === 'object') options = pass;
  if (!options) {
    options = { type: 'basic' };
  }
  switch (options.type) {
    case 'bearer':
      return this.set('Authorization', 'Bearer ' + user);    
      
    default: // 'basic'
      if (!~user.indexOf(':')) user = user + ':';
      var str = new Buffer(user + pass).toString('base64');
      return this.set('Authorization', 'Basic ' + str);    
  }
};

/**
 * Set the certificate authority option for https request.
 *
 * @param {Buffer | Array} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.ca = function(cert){
  this._ca = cert;
  return this;
};

/**
 * Set the client certificate key option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.key = function(cert){
  this._key = cert;
  return this;
};

/**
 * Set the key, certificate, and CA certs of the client in PFX or PKCS12 format.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.pfx = function(cert){
  this._pfx = cert;
  return this;
};

/**
 * Set the client certificate option for https request.
 *
 * @param {Buffer | String} cert
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.cert = function(cert){
  this._cert = cert;
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

  var options = {};
  var url = this.url;
  var retries = this._retries;

  // default to http://
  if (0 != url.indexOf('http')) url = 'http://' + url;
  url = parse(url);

  // support unix sockets
  if (/^https?\+unix:/.test(url.protocol) === true) {
    // get the protocol
    url.protocol = url.protocol.split('+')[0] + ':';

    // get the socket, path
    var unixParts = url.path.match(/^([^/]+)(.+)$/);
    options.socketPath = unixParts[1].replace(/%2F/g, '/');
    url.pathname = unixParts[2];
  }

  // options
  options.method = this.method;
  options.port = url.port;
  options.path = url.pathname;
  options.host = url.hostname;
  options.ca = this._ca;
  options.key = this._key;
  options.pfx = this._pfx;
  options.cert = this._cert;
  options.agent = this._agent;

  // initiate request
  var mod = exports.protocols[url.protocol];

  // request
  var req = this.req = mod.request(options);
  if ('HEAD' != options.method) {
    req.setHeader('Accept-Encoding', 'gzip, deflate');
  }
  this.protocol = url.protocol;
  this.host = url.host;

  this._unitRequest = new UnitRequest(this, req);

  // auth
  if (url.auth) {
    var auth = url.auth.split(':');
    this.auth(auth[0], auth[1]);
  }

  // query
  if (url.search)
    this.query(url.search.substr(1));

  // add cookies
  if (this.cookies) req.setHeader('Cookie', this.cookies);

  for (var key in this.header) {
    if (this.header.hasOwnProperty(key))
      req.setHeader(key, this.header[key]);
  }

  try {
    this._appendQueryString(req);
  } catch (e) {
    return this.emit('error', e);
  }

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
  // console.log(this._retries, this._maxRetries)
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
    return this._retry();
  }

  // Avoid the error which is emitted from 'socket hang up' to cause the fn undefined error on JS runtime.
  var fn = this._callback || noop;
  this.clearTimeout();
  if (this.called) return console.warn('superagent: double callback bug');
  this.called = true;

  if (!err) {
    if (this._isResponseOK(res)) {
      fn(err, res);
      this.destroy();
      return;
    }

    var msg = 'Unsuccessful HTTP response';
    if (res) {
      msg = http.STATUS_CODES[res.status] || msg;
    }
    err = new Error(msg);
    err.status = res ? res.status : undefined;
  }

  err.response = res;
  if (this._maxRetries) err.retries = this._retries - 1;

  // only emit error event if there is a listener
  // otherwise we assume the callback to `.end()` will get the error
  if (err && this.listeners('error').length > 0) {
    this.emit('error', err);
  }

  fn(err, res);
  this.destroy();
};

/**
 * Compose querystring to append to req.path
 *
 * @return {String} querystring
 * @api private
 */

Request.prototype._appendQueryString = function(req){
  var query = qs.stringify(this.qs, { indices: false, strictNullHandling: true });
  query += ((query.length && this.qsRaw.length) ? '&' : '') + this.qsRaw.join('&');
  req.path += query.length ? (~req.path.indexOf('?') ? '&' : '?') + query : '';

  if (this._sort) {
    var index = req.path.indexOf('?');
    if (index >= 0) {
      var queryArr = req.path.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      req.path = req.path.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  return Buffer.isBuffer(obj) || obj instanceof Stream || obj instanceof FormData;
}

/**
 * Initiate request, invoking callback `fn(err, res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  this.request();
  debug('%s %s', this.method, this.url);

  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var data = this._data;
  var req = this.req;
  var buffer = this._buffer;
  var method = this.method;

  this._setTimeouts();

  // body
  if ('HEAD' != method && !req._headerSent) {
    // serialize stuff
    if ('string' != typeof data) {
      var contentType = req.getHeader('Content-Type')
      // Parse out just the content type from the header (ignore the charset)
      if (contentType) contentType = contentType.split(';')[0]
      var serialize = exports.serialize[contentType];
      if (!serialize && isJSON(contentType)) {
        serialize = exports.serialize['application/json'];
      }
      if (serialize) data = serialize(data);
    }

    // content-length
    if (data && !req.getHeader('Content-Length')) {
      req.setHeader('Content-Length', Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data));
    }
  }

  this._unitRequest._setResponseHandler();
  this.emit('request', this);

  // if a FormData instance got created, then we send that as the request body
  var formData = this._formData;
  if (formData) {

    // set headers
    var headers = formData.getHeaders();
    for (var i in headers) {
      debug('setting FormData header: "%s: %s"', i, headers[i]);
      req.setHeader(i, headers[i]);
    }

    // attempt to get "Content-Length" header
    formData.getLength(this._onFormDataLength.bind(this, req));
  } else {
    req.end(data);
  }

  return this;
};

Request.prototype._onFormDataLength = function (req, err, length) {
  // TODO: Add chunked encoding when no length (if err)

  debug('got FormData Content-Length: %s', length);
  if ('number' == typeof length) {
    req.setHeader('Content-Length', length);
  }

  this._formData.pipe(this._getProgressMonitor(req)).pipe(req);
};

Request.prototype._getProgressMonitor = function (req) {
  var progress = new Stream.Transform();
  progress._transform = this._progressTransform.bind(this, {loaded: 0, total: req.getHeader('Content-Length')});
  return progress;
}

Request.prototype._progressTransform = function (transformobj, chunk, encoding, cb) {
  transformobj.loaded += chunk.length;
  this.emit('progress', {
    direction: 'upload',
    lengthComputable: true,
    loaded: transformobj.loaded,
    total: transformobj.total
  });
  cb(null, chunk);
}

/**
 * Check whether response has a non-0-sized gzip-encoded body
 */
Request.prototype._shouldUnzip = function(res){
  if (res.statusCode === 204 || res.statusCode === 304) {
    // These aren't supposed to have any body
    return false;
  }

  // header content is a string, and distinction between 0 and no information is crucial
  if ('0' === res.headers['content-length']) {
    // We know that the body is empty (unfortunately, this check does not cover chunked encoding)
    return false;
  }

  // console.log(res);
  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
};

// generate HTTP verb methods
if (methods.indexOf('del') == -1) {
  // create a copy so we don't cause conflicts with
  // other packages using the methods package and
  // npm 3.x
  methods = methods.slice(0);
  methods.push('del');
}
methods.forEach(function(method){
  var name = method;
  method = 'del' == method ? 'delete' : method;

  method = method.toUpperCase();
  request[name] = function(url, data, fn){
    var req = request(method, url);
    if ('function' == typeof data) fn = data, data = null;
    if (data) req.send(data);
    fn && req.end(fn);
    return req;
  };
});

/**
 * Check if `mime` is text and should be buffered.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api public
 */

function isText(mime) {
  var parts = mime.split('/');
  var type = parts[0];
  var subtype = parts[1];

  return 'text' == type
    || 'x-www-form-urlencoded' == subtype;
}

function isImageOrVideo(mime) {
  var type = mime.split('/')[0];

  return 'image' == type || 'video' == type;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Check if we should follow the redirect `code`.
 *
 * @param {Number} code
 * @return {Boolean}
 * @api private
 */

function isRedirect(code) {
  return ~[301, 302, 303, 305, 307, 308].indexOf(code);
}


function UnitRequest (reqinstance, req) {
  this.emitDrainer = this.emitDrain.bind(this);
  this.onErrorer = this.onError.bind(this);
  this.onReqResponseForPipeContinueer = this.onReqResponseForPipeContinue.bind(this);
  this.onReqResponseer = this.onReqResponse.bind(this);
  this.destroyer = this.destroy.bind(this);
  this.errorToCallbacker = this.errorToCallback.bind(this);
  this.onParserHandlesEnder = this.onParserHandlesEnd.bind(this);
  this.reqInstance = reqinstance;
  this.req = req;
  this.res = null;
  this.response = null;
  this.parserHandlesEnd = null;
  req.once('drain', this.emitDrainer);
  req.once('error', this.onErrorer);
  req.once('abort', this.reqAbortToCallback.bind(this));
  req.once('aborted', this.reqAbortToCallback.bind(this));
}
UnitRequest.prototype.destroy = function () {
  this.parserHandlesEnd = null;
  this.response = null;
  if (this.res) {
    this.res.removeAllListeners();
  }
  this.res = null;
  if (this.req) {
    doRemoveListener(this.req, 'drain', this.emitDrainer);
    doRemoveListener(this.req, 'error', this.onErrorer);
    doRemoveListener(this.req, 'response', this.onReqResponseForPipeContinueer);
    doRemoveListener(this.req, 'response', this.onReqResponseer);
    doRemoveListener(this.req, 'end', this.destroyer);
    doRemoveListener(this.req, 'error', this.errorToCallbacker);
    doRemoveListener(this.req, 'end', this.onParserHandlesEnder);
  }
  this.req = null;
  if (this.reqInstance) {
    debug('end %s %s', this.reqInstance.method, this.reqInstance.url);
    this.reqInstance.emit('end');
  }
  this.reqInstance = null;
  this.onParserHandlesEnder = null;
  this.errorToCallbacker = null;
  this.destroyer = null;
  this.onReqResponseer = null;
  this.onReqResponseForPipeContinueer = null;
  this.onErrorer = null;
  this.emitDrainer = null;
};
UnitRequest.prototype.emitDrain = function () {
  if (!this.reqInstance) return;
  this.reqInstance.emit('drain');
};
UnitRequest.prototype.onError = function (err) {
  var reqinst = this.reqInstance;
  if (!reqinst) return;
  // flag abortion here for out timeouts
  // because node will emit a faux-error "socket hang up"
  // when request is aborted before a connection is made
  if (reqinst._aborted) {
    this.destroy();
    return;
  }
  // if not the same, we are in the **old** (cancelled) request,
  // so need to continue (same as for above)
  if (reqinst._unitRequest !== this) return;
  // if we've received a response then we don't want to let
  // an error in the request blow up the response
  if (this.response) return;
  reqinst.callback(err);
};
UnitRequest.prototype._pipeContinue = function (stream, options) {
  console.log('set response handler in _pipeContinue');
  this.req.once('response', this.onReqResponseForPipeContinueer);
};
UnitRequest.prototype._setResponseHandler = function () {
  if (!this.req) return;
  this.req.once('response', this.onReqResponseer);
};
UnitRequest.prototype.onReqResponseForPipeContinue = function (res) {
  var reqinst = this.reqInstance, redirect;
  if (!reqinst) return;
  redirect = isRedirect(res.statusCode);
  if (redirect && reqinst._redirects++ != reqinst._maxRedirects) {
    return reqinst._redirect(res)._pipeContinue(stream, options);
  }

  this.res = res;
  this._emitResponse();
  if (reqinst._aborted) {
    this.destroy();
    return;
  }

  if (reqinst._shouldUnzip(res)) {
    res.pipe(zlib.createUnzip()).pipe(stream, options);
  } else {
    res.pipe(stream, options);
  }
  this.attachToResTermination();
};
UnitRequest.prototype.onReqResponse = function (res) {
  var reqinst = this.reqInstance;
  if (!reqinst) return;
  debug('%s %s -> %s', reqinst.method, reqinst.url, res.statusCode);

  if (reqinst._responseTimeoutTimer) {
    clearTimeout(reqinst._responseTimeoutTimer);
  }

  if (reqinst.piped) {
    this.destroy();
    return;
  }

  var max = reqinst._maxRedirects;
  var mime = utils.type(res.headers['content-type'] || '') || 'text/plain';
  var type = mime.split('/')[0];
  var multipart = 'multipart' == type;
  var redirect = isRedirect(res.statusCode);
  var parser = reqinst._parser;
  var buffer = reqinst.buffer;

  this.res = res;

  // redirect
  if (redirect && reqinst._redirects++ != max) {
    reqinst._redirect(res);
    this.destroy();
    return;
  }

  if ('HEAD' == reqinst.method) {
    reqinst.emit('end');
    this.invokeCallback(null, this._emitResponse());
    return;
  }

  // zlib support
  if (reqinst._shouldUnzip(res)) {
    unzip(this.req, res);
  }

  if (!parser) {
    if (this._responseType) {
      parser = exports.parse.image; // It's actually a generic Buffer
      buffer = true;
    } else if (multipart) {
      var form = new formidable.IncomingForm();
      parser = form.parse.bind(form);
      buffer = true;
    } else if (isImageOrVideo(mime)) {
      parser = exports.parse.image;
      buffer = true; // For backwards-compatibility buffering default is ad-hoc MIME-dependent
    } else if (exports.parse[mime]) {
      parser = exports.parse[mime];
    } else if ('text' == type) {
      parser = exports.parse.text;
      buffer = (buffer !== false);

      // everyone wants their own white-labeled json
    } else if (isJSON(mime)) {
      parser = exports.parse['application/json'];
      buffer = (buffer !== false);
    } else if (buffer) {
      parser = exports.parse.text;
    }
  }

  // by default only buffer text/*, json and messed up thing from hell
  if (undefined === buffer && isText(mime) || isJSON(mime)) {
    buffer = true;
  }

  this.parserHandlesEnd = false;
  if (parser) {
    try {
      // Unbuffered parsers are supposed to emit response early,
      // which is weird BTW, because response.body won't be there.
      this.parserHandlesEnd = buffer;
      parser(res, this.onParserResult.bind(this));
    } catch (err) {
      this.invokeCallback(err);
      return;
    }
  }

  this.res = res;

  // unbuffered
  if (!buffer) {
    debug('unbuffered %s %s', reqinst.method, reqinst.url);
    reqinst.callback(null, this._emitResponse());
    if (multipart) {
      this.destroy();
      return; 
    }
    this.attachToResTermination();
    return;
  }

  // terminating events
  this.attachToResTermination();
  if (!this.parserHandlesEnd) res.once('end', this.onParserHandlesEnder);
};
UnitRequest.prototype._emitResponse = function (body, files) {
  var reqinst = this.reqInstance;
  if (!reqinst) {
    return;
  }
  response = new Response(this);
  this.response = response;
  response.redirects = this._redirectList;
  if (undefined !== body) {
    response.body = body;
  }
  response.files = files;
  reqinst.emit('response', response);
  return response;
};
UnitRequest.prototype.onParserResult = function (err, obj, files) {
  var reqinst = this.reqInstance;
  if (!reqinst) return;
  if (reqinst.timedout) {
    // Timeout has already handled all callbacks
    this.destroy();
    return;
  }

  // Intentional (non-timeout) abort is supposed to preserve partial response,
  // even if it doesn't parse.
  if (err && !reqinst._aborted) {
    return this.invokeCallback(err);
  }

  if (this.parserHandlesEnd) {
    reqinst.emit('end');
    this.invokeCallback(null, this._emitResponse(obj, files));
  }
  this.destroy();
};
UnitRequest.prototype.errorToCallback = function (err) {
  this.invokeCallback(err, null);
};
UnitRequest.prototype.reqAbortToCallback = function () {
  /*
  var err = new Error('Request aborted by client');
  err.code = 'ECONNABORTED';
  err.timeout = 1;
  return this.errorToCallback(err);
  */
  if (this.destroyer) {
    setTimeout(this.destroyer, 1000);
  }
};
UnitRequest.prototype.onParserHandlesEnd = function () {
  var reqinst = this.reqInstance;
  if (!reqinst) return;
  debug('end %s %s', reqinst.method, reqinst.url);
  // TODO: unless buffering emit earlier to stream
  reqinst.emit('end');
  this.invokeCallback(null, this._emitResponse());
};
UnitRequest.prototype.toJSON = function () {
  return this.reqInstance ? this.reqInstance.toJSON() : '{}';
};
UnitRequest.prototype.attachToResTermination = function () {
  this.res.once('error', this.errorToCallbacker);
  //this.res.once('aborted', this.destroyer);
  //this.res.once('close', this.destroyer);
};
UnitRequest.prototype.invokeCallback = function (err, res) {
  var reqinst = this.reqInstance;
  if (!reqinst) return;
  reqinst.callback(err, res);
  this.destroy();
};
