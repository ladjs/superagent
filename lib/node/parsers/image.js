
module.exports = function(res, fn){
  var data = '';
  res.on('data', function(chunk){ data += chunk; });
  res.on('end', function () {
    fn(null, data);
  });
};
