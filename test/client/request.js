var assert = require('assert');
var request = require('../../');

describe('request', function() {
  this.timeout(10000);

it('request() error object', function(next) {
  request('GET', '/error').end(function(err, res) {
    assert(err);
    assert(res.error, 'response should be an error');
    assert(res.error.message == 'cannot GET /error (500)');
    assert(res.error.status == 500);
    assert(res.error.method == 'GET');
    assert(res.error.url == '/error');
    next();
  });
});

// This test results in a weird Jetty error on IE9 and IE11 saying PATCH is not a supported method. Looks like something's up with SauceLabs
var isIE11 = !!navigator.userAgent.match(/Trident.*rv[ :]*11\./);
var isIE9OrOlder = !window.atob;
if (!isIE9OrOlder && !isIE11) { // Don't run on IE9 or older, or IE11
  it('patch()', function(next){
    request.patch('/user/12').end(function(err, res){
      assert('updated' == res.text);
      next();
    });
  });
}

it('POST native FormData', function(next){
  if (!window.FormData) {
    // Skip test if FormData is not supported by browser
    return next();
  }

  var data = new FormData();
  data.append('foo', 'bar');

  request
    .post('/echo')
    .send(data)
    .end(function(err, res){
      assert('multipart/form-data' == res.type);
      next();
    });
});

it('defaults attached files to original file names', function(next){
  if (!window.FormData) {
    // Skip test if FormData is are not supported by browser
    return next();
  }

  try {
    var file = new File([""], "image.jpg", { type: "image/jpeg" });
  } catch(e) {
    // Skip if file constructor not supported.
    return next();
  }

  request
    .post('/echo')
    .attach('image', file)
    .end(function(err, res){
      var regx = new RegExp('filename="' + file.name + '"');
      assert(res.text.match(regx) !== null);
      next();
    });
});

it('GET invalid json', function(next) {
  request
  .get('/invalid-json')
  .end(function(err, res) {
    assert(err.parse);
    assert.deepEqual(err.rawResponse, ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
    next();
  });
});

it('GET querystring empty objects', function(next){
  var req = request
  .get('/querystring')
  .query({})
  .end(function(err, res){
    assert.deepEqual(req._query, []);
    assert.deepEqual(res.body, {});
    next();
  });
});

it('GET querystring object .get(uri, obj)', function(next){
  request
  .get('/querystring', { search: 'Manny' })
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

it('GET querystring object .get(uri, obj, fn)', function(next){
  request
  .get('/querystring', { search: 'Manny'}, function(err, res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

window.btoa = window.btoa || null;
it('basic auth', function(next){
  window.btoa = window.btoa || require('Base64').btoa;

  request
  .post('/auth')
  .auth('foo', 'bar')
  .end(function(err, res){
    assert('foo' == res.body.user);
    assert('bar' == res.body.pass);
    next();
  });
});

it('progress event listener on xhr object registered when some on the request', function(){
  var req = request
  .get('/foo')
  .on('progress', function(data) {
  })
  .end();

  if (req.xhr.upload) { // Only run assertion on capable browsers
    assert(null !== req.xhr.upload.onprogress);
  }
});

it('no progress event listener on xhr object when none registered on request', function(){
  var req = request
  .get('/foo')
  .end();

  if (req.xhr.upload) { // Only run assertion on capable browsers
    assert(null === req.xhr.upload.onprogress);
  }
});

it('Request#parse overrides body parser no matter Content-Type', function(done){
  var runParser = false;

  function testParser(data){
    runParser = true;
    return JSON.stringify(data);
  }

  var req = request
  .post('/user')
  .parse(testParser)
  .type('json')
  .send({ foo: 123 })
  .end(function(err) {
    if (err) return done(err);
    assert(runParser);
    done();
  });
});

// Don't run on browsers without xhr2 support
if ('FormData' in window) {
  it('xhr2 download file', function(next) {
    request.parse['application/vnd.superagent'] = function (obj) {
      return obj;
    };

    request
    .get('/arraybuffer')
    .on('request', function () {
      this.xhr.responseType = 'arraybuffer';
    })
    .on('response', function(res) {
      assert(res.body instanceof ArrayBuffer);
      next();
    })
    .end();
  });
}

});
