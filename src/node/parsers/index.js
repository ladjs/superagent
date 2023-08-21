const urlencoded = require('./urlencoded.js');
const json = require('./json.js');
const text = require('./text.js');
const binary = require('./image.js');

module.exports = {
  'application/x-www-form-urlencoded': urlencoded,
  'application/json': json,
  'text': text,
  'application/json-seq': text,
  'application/octet-stream': binary,
  'application/pdf': binary,
  'image': binary
}
