
exports['application/x-www-form-urlencoded'] = require('./urlencoded');
exports['application/json'] = require('./json');
exports.text = require('./text');

var binary = require('./image');
exports['application/octet-stream'] = binary;
exports.image = binary;
