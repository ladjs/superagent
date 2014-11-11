
module.exports = function parseJSON(res, fn){
  res.text = '';
  res.setEncoding('utf8');
  res.on('data', function(chunk){ res.text += chunk;});
  res.on('end', function(){
    try {
      var text = res.text && res.text.replace(/^\s*|\s*$/g, '');
      var body = text && JSON.parse(text);
    } catch (e) {
      var err = e;
    } finally {
      fn(err, body);
    }
  });
};
