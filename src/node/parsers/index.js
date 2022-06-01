exports['application/x-www-form-urlencoded'] = require('./urlencoded');
exports['application/json'] = require('./json');
exports.text = require('./text');

exports['application/json-seq'] = exports.text;

const binary = require('./image');

exports['application/octet-stream'] = binary;
exports['application/pdf'] = binary;
exports.image = binary;
