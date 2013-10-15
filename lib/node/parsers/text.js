module.exports = function (res, fn) {
  res.text = '';
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    res.text += chunk;
  });
  res.on('error', function (err) {
    fn(err);
  });
  res.on('end', function () {
    fn(null, res.text);
  });
};