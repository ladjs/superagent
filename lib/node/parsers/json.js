function dataHandler (handleobj, chunk) {
  if (!(handleobj && handleobj.res)) return;
  handleobj.res.text += chunk;
}

function endHandler (handleobj) {
  var body, err;
  if (!(handleobj && handleobj.res && handleobj.fn)) return;
  try {
    body = handleobj.res.text && JSON.parse(handleobj.res.text);
  } catch (e) {
    err = e;
    // issue #675: return the raw response if the response parsing fails
    err.rawResponse = handleobj.res.text || null;
    // issue #876: return the http status code if the response parsing fails
    err.statusCode = handleobj.res.statusCode;
  } finally {
    handleobj.fn(err, body);
    handleobj.res.removeListener('data', handleobj.dataHandler);
    handleobj.res.removeListener('end', handleobj.endHandler);
    handleobj.fn = null;
    handleobj.res = null;
    handleobj.dataHandler = null;
    handleobj.endHandler = null;
  }
}

module.exports = function parseJSON(res, fn){
  var handleobj = {
    res: res,
    fn: fn,
    dataHandler: null,
    endHandler: null
  };
  res.text = '';
  res.setEncoding('utf8');
  handleobj.dataHandler = dataHandler.bind(null, handleobj);
  handleobj.endHandler = endHandler.bind(null, handleobj);

  res.on('data', handleobj.dataHandler);
  res.on('end', handleobj.endHandler);
};
