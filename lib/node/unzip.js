
/**
 * Module dependencies.
 */

var StringDecoder = require('string_decoder').StringDecoder;
var Stream = require('stream');
var zlib = require('zlib');

/**
 * Buffers response data events and re-emits when they're unzipped.
 *
 * @param {Request} req
 * @param {Response} res
 * @api private
 */

function noop () {}

function onUnzipError (unzipobj, err) {
  if (!(unzipobj && unzipobj.stream)) return;
  if (err && err.code === 'Z_BUF_ERROR') { // unexpected end of file is ignored by browsers and curl
    unzipobj.stream.emit('end');
    return;
  }
  unzipobj.stream.emit('error', err);
}

function onUnzipData (unzipobj, buf) {
  if (!unzipobj.stream) return;
  if (unzipobj.decoder) {
    var str = unzipobj.decoder.write(buf);
    if (str.length) unzipobj.stream.emit('data', str);
  } else {
    unzipobj.stream.emit('data', buf);
  }
}

function onUnzipEnd (unzipobj) {
  if (unzipobj.unzip) {
    if (unzipobj.res) {
      unzipobj.res.unpipe(unzipobj.unzip);
    }
    if (unzipobj.dataHandler) {
      unzipobj.unzip.removeListener('data', unzipobj.dataHandler);
    }
    if (unzipobj.errorHandler) {
      unzipobj.unzip.removeListener('error', unzipobj.errorHandler);
    }
    if (unzipobj.endHandler) {
      unzipobj.unzip.removeListener('end', unzipobj.endHandler);
    }
  }
  unzipobj.dataHandler = null;
  unzipobj.errorHandler = null;
  unzipobj.endHandler = null;
  unzipobj.unzip = null;
  unzipobj.decoder = null;
  if (unzipobj.stream) {
    unzipobj.stream.emit('end');
    unzipobj.stream.req = null;
    unzipobj.stream.removeAllListeners();
  }
  unzipobj.stream = null;
  if (unzipobj.res && unzipobj._on) {
    unzipobj.res.setEncoding = noop;
    unzipobj.res.on = unzipobj._on;
  }
  unzipobj._on = null;
  unzipobj.res = null;
}

function encodingSetter (unzipobj, type) {
  unzipobj.decoder = new StringDecoder(type);
}

function resOnSubstitute (unzipobj, type, fn) {
  if (!(unzipobj && unzipobj.stream && unzipobj._on && unzipobj.res)) return;
  if ('data' == type) {
    unzipobj.stream.on(type, fn);
  } else if ('error' == type || 'end' == type) {
    unzipobj.stream.on(type, fn);
    unzipobj._on.call(unzipobj.res, type, fn);
  } else {
    unzipobj._on.call(unzipobj.res, type, fn);
  }
  return this;
}

exports.unzip = function(req, res){
  var unzip = zlib.createUnzip();
  var unzipobj = {
    stream: new Stream,
    res: res,
    _on: res.on,
    unzip: unzip,
    decoder: null,
    dataHandler: null,
    errorHandler: null,
    endHandler: null
  };

  unzipobj.errorHandler = onUnzipError.bind(null, unzipobj);
  unzipobj.dataHandler = onUnzipData.bind(null, unzipobj);
  unzipobj.endHandler = onUnzipEnd.bind(null, unzipobj);

  // make node responseOnEnd() happy
  unzipobj.stream.req = req;

  unzip.on('error', unzipobj.errorHandler);

  // pipe to unzip
  res.pipe(unzip);

  // override `setEncoding` to capture encoding
  res.setEncoding = encodingSetter.bind(null, unzipobj);

  // decode upon decompressing with captured encoding
  unzip.on('data', unzipobj.dataHandler);

  unzip.on('end', unzipobj.endHandler);

  // override `on` to capture data listeners
  res.on = resOnSubstitute.bind(null, unzipobj);
};
