/**
 * Module dependencies.
 */

const qs = require('qs');

module.exports = (res, fn) => {
  res.text = '';
  res.setEncoding('ascii');
  res.on('data', chunk => {
    res.text += chunk;
  });
  res.on('end', () => {
    try {
      fn(null, qs.parse(res.text));
    } catch (err) {
      fn(err);
    }
  });
};
