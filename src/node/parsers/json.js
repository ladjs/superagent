module.exports = function (res, fn) {
  res.text = '';
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    res.text += chunk;
  });
  res.on('end', () => {
    let body;
    let error;
    try {
      body = res.text && JSON.parse(res.text);
    } catch (err) {
      error = err;
      // issue #675: return the raw response if the response parsing fails
      error.rawResponse = res.text || null;
      // issue #876: return the http status code if the response parsing fails
      error.statusCode = res.statusCode;
    } finally {
      fn(error, body);
    }
  });
};
