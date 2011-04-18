
/*!
 * superagent - parsers
 * Copyright (c) 2011 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Text "parser".
 */

exports['text/*'] = function(str){ return str; };

/**
 * JSON parser.
 */

exports['application/json'] = JSON.parse;

/**
 * Form parser.
 */

exports['application/x-www-form-urlencoded'] = require('qs').parse;