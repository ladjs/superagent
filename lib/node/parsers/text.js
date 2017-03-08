function dataHandler(handleobj, chunk) {
  if (!(handleobj && handleobj.res)) return;
  handleobj.res.text += chunk;
}

function endHandler(handleobj) {
  if (!(handleobj && handleobj.res && handleobj.fn)) return;
  handleobj.fn(); //null, res.text); //consistency??
  handleobj.res.removeListener('data', handleobj.dataHandler);
  handleobj.res.removeListener('end', handleobj.endHandler);
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
  res.setEncoding('utf8');
  handleobj.dataHandler = dataHandler.bind(null, handleobj);
  handleobj.endHandler = endHandler.bind(null, handleobj);
  res.on('data', handleobj.dataHandler);
  res.on('end', handleobj.endHandler);
};
