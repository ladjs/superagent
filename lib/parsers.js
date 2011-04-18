
/*!
 * superagent - parsers
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var agent = require('./superagent');

/**
 * Register a function to parse the given `mime` type.
 *
 * @param {String} mime
 * @param {Function} fn
 * @api public
 */

agent.parse = function(mime, fn){
  exports[mime] = fn;
};

/**
 * Text "parser".
 */

agent.parse('text/*', function(str){ return str; });

/**
 * JSON parser.
 */

agent.parse('application/json', JSON.parse);

/**
 * Form parser.
 */

agent.parse('application/x-www-form-urlencoded', require('qs').parse);
