
module.exports = function parseJSON(res, fn){
  res.text = '';
  res.setEncoding('utf8');
  res.on('data', function(chunk){ res.text += chunk;});
  res.on('end', function(){
    try {
      var body = res.text && JSON.parse(res.text);
    } catch (e) {
      var err = e;
    } finally {
      fn(err, body);
    }
  });
};
