
/*!
 * just
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var parse = require('url').parse
  , http = require('http')
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
 * Initialize a `SuperAgent` with the given `options`.
 *
 * @param {Object} options
 * @api public
 */

function SuperAgent(options) {
  Agent.call(this, options);
}

/**
 * Inherit from `Agent.prototype`.
 */

SuperAgent.prototype.__proto__ = Agent.prototype;

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

  // url
  if ('string' == typeof options) {
    var url = parse(options);
    options = {
        host: url.hostname
      , port: url.port
      , path: url.pathname + (url.search || '')
    };
  // from url.parse()
  } else if (options.hostname) {
    options = {
        host: options.hostname
      , port: options.port
      , path: options.pathname + (options.search || '')
    };
  }

  // http method
  options.method = method;

  // agent
  var agent = new SuperAgent(options);
  return agent.appendMessage(options);
}