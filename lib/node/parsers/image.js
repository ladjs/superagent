function dataHandler (handleobj, chunk) {
  if (!(handleobj && handleobj.data)) return;
  handleobj.data.push(chunk);
}

function endHandler (handleobj) {
  if (!(handleobj && handleobj.fn && handleobj.res)) return;
  handleobj.fn(null, Buffer.concat(handleobj.data));
  handleobj.res.removeListener('data', handleobj.dataHandler);
  handleobj.res.removeListener('end', handleobj.endHandler);
  handleobj.dataHandler = null;
  handleobj.endHandler = null;
  handleobj.res = null;
  handleobj.fn = null;
  handleobj.data = null;
}

module.exports = function(res, fn){
  var handleobj = {
    res: res,
    fn: fn,
    data: [],
    dataHandler: null,
    endHandler: null
  }; // Binary data needs binary storage

  handleobj.dataHandler = dataHandler.bind(null, handleobj);
  handleobj.endHandler = endHandler.bind(null, handleobj);

  res.on('data', handleobj.dataHandler);
  res.on('end', handleobj.endHandler);
};
