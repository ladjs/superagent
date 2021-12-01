/**
 * Module dependencies.
 */

const { StringDecoder } = require('string_decoder');
const Stream = require('stream');
const zlib = require('zlib');

/**
 * Buffers response data events and re-emits when they're unzipped.
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

exports.unzip = (request, res) => {
  const unzip = zlib.createUnzip();
  const stream = new Stream();
  let decoder;

  // make node responseOnEnd() happy
  stream.req = request;

  unzip.on('error', (error) => {
    if (error && error.code === 'Z_BUF_ERROR') {
      // unexpected end of file is ignored by browsers and curl
      stream.emit('end');
      return;
    }

    stream.emit('error', error);
  });

  // pipe to unzip
  res.pipe(unzip);

  // override `setEncoding` to capture encoding
  res.setEncoding = (type) => {
    decoder = new StringDecoder(type);
  };

  // decode upon decompressing with captured encoding
  unzip.on('data', (buf) => {
    if (decoder) {
      const string_ = decoder.write(buf);
      if (string_.length > 0) stream.emit('data', string_);
    } else {
      stream.emit('data', buf);
    }
  });

  unzip.on('end', () => {
    stream.emit('end');
  });

  // override `on` to capture data listeners
  const _on = res.on;
  res.on = function (type, fn) {
    if (type === 'data' || type === 'end') {
      stream.on(type, fn.bind(res));
    } else if (type === 'error') {
      stream.on(type, fn.bind(res));
      _on.call(res, type, fn);
    } else {
      _on.call(res, type, fn);
    }

    return this;
  };
};
