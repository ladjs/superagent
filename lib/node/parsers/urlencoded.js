
/**
 * Module dependencies.
 */

var qs = require('qs');

function dataHandler (handleobj, chunk) {
  if (!(handleobj && handleobj.res)) return;
  handleobj.res.text += chunk;
}

function endHandler (handleobj) {
  if (!(handleobj && handleobj.fn)) return;
  try {
    handleobj.fn(null, qs.parse(handleobj.res.text));
  } catch (err) {
    handleobj.fn(err);
  }
  if (handleobj.res) {
    handleobj.res.removeListener('data', handleobj.dataHandler);
    handleobj.res.removeListener('end', handleobj.endHandler);
  }
  handleobj.res = null;
  handleobj.fn = null;
  handleobj.dataHandler = null;
  handleobj.endHandler = null;
}

module.exports = function(res, fn){
  var handleobj = {
    res: res,
    fn: fn,
    dataHandler: null,
    endHandler: null
  };
  res.text = '';
  res.setEncoding('ascii');
  handleobj.dataHandler = dataHandler.bind(null, handleobj);
  handleobj.endHandler = endHandler.bind(null, handleobj);
  res.on('data', handleobj.dataHandler)
  res.on('end', handleobj.endHandler);
};
