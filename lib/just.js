
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
 * Library version.
 */

exports.version = '0.0.1';

function SuperAgent(options) {
  Agent.call(this, options);
}

/**
 * Inherit from `Agent.prototype`.
 */

SuperAgent.prototype.__proto__ = Agent.prototype;

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
  }

  // http method
  options.method = method;

  // agent
  var agent = new SuperAgent(options);
  return agent.appendMessage(options);
}