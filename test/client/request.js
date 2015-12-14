var assert = require('assert');
var request = require('../../');

describe('request', function() {
  this.timeout(10000);

it('Request inheritance', function(){
  assert(request.get('/') instanceof request.Request);
});

it('request() simple GET without callback', function(next){
  request('GET', 'test/test.request.js').end();
  next();
});

it('request() simple GET', function(next){
  request('GET', '/ok').end(function(err, res){
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(res.text, 'res.text');
    next();
  });
});

it('request() simple HEAD', function(next){
  request.head('/ok').end(function(err, res){
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(!res.text, 'res.text');
    next();
  });
});

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

it('request() GET 5xx', function(next){
  request('GET', '/error').end(function(err, res){
    assert(err);
    assert(err.message == 'Internal Server Error');
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(!res.clientError, 'response should not be a client error');
    assert(res.serverError, 'response should be a server error');
    next();
  });
});

it('request() GET 4xx', function(next){
  request('GET', '/notfound').end(function(err, res){
    assert(err);
    assert.equal(err.message, 'Not Found');
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(res.clientError, 'response should be a client error');
    assert(!res.serverError, 'response should not be a server error');
    next();
  });
});

it('request() GET 404 Not Found', function(next){
  request('GET', '/notfound').end(function(err, res){
    assert(err);
    assert(res.notFound, 'response should be .notFound');
    next();
  });
});

it('request() GET 400 Bad Request', function(next){
  request('GET', '/bad-request').end(function(err, res){
    assert(err);
    assert(res.badRequest, 'response should be .badRequest');
    next();
  });
});

it('request() GET 401 Bad Request', function(next){
  request('GET', '/unauthorized').end(function(err, res){
    assert(err);
    assert(res.unauthorized, 'response should be .unauthorized');
    next();
  });
});

it('request() GET 406 Not Acceptable', function(next){
  request('GET', '/not-acceptable').end(function(err, res){
    assert(err);
    assert(res.notAcceptable, 'response should be .notAcceptable');
    next();
  });
});

it('request() GET 204 No Content', function(next){
  request('GET', '/no-content').end(function(err, res){
    assert.ifError(err);
    assert(res.noContent, 'response should be .noContent');
    next();
  });
});

it('request() DELETE 204 No Content', function(next){
  request('DELETE', '/no-content').end(function(err, res){
    assert.ifError(err);
    assert(res.noContent, 'response should be .noContent');
    next();
  });
});

it('request() header parsing', function(next){
  request('GET', '/notfound').end(function(err, res){
    assert(err);
    assert('text/html; charset=utf-8' == res.header['content-type']);
    assert('Express' == res.header['x-powered-by']);
    next();
  });
});

it('request() .status', function(next){
  request('GET', '/notfound').end(function(err, res){
    assert(err);
    assert(404 == res.status, 'response .status');
    assert(4 == res.statusType, 'response .statusType');
    next();
  });
});

it('get()', function(next){
  request.get('/notfound').end(function(err, res){
    assert(err);
    assert(404 == res.status, 'response .status');
    assert(4 == res.statusType, 'response .statusType');
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

it('put()', function(next){
  request.put('/user/12').end(function(err, res){
    assert('updated' == res.text, 'response text');
    next();
  });
});

it('post()', function(next){
  request.post('/user').end(function(err, res){
    assert('created' == res.text, 'response text');
    next();
  });
});

it('del()', function(next){
  request.del('/user/12').end(function(err, res){
    assert('deleted' == res.text, 'response text');
    next();
  });
});

it('delete()', function(next){
  request.delete('/user/12').end(function(err, res){
    assert('deleted' == res.text, 'response text');
    next();
  });
});

it('post() data', function(next){
  request.post('/todo/item')
  .type('application/octet-stream')
  .send('tobi')
  .end(function(err, res){
    assert('added "tobi"' == res.text, 'response text');
    next();
  });
});

it('request .type()', function(next){
  request
  .post('/user/12/pet')
  .type('urlencoded')
  .send('pet=tobi')
  .end(function(err, res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

it('request .type() with alias', function(next){
  request
  .post('/user/12/pet')
  .type('application/x-www-form-urlencoded')
  .send('pet=tobi')
  .end(function(err, res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

it('request .get() with no data or callback', function(next){
  request.get('/echo-header/content-type');
  next();
});

it('request .send() with no data only', function(next){
  request.post('/user/5/pet').type('urlencoded').send('pet=tobi');
  next();
});

it('request .send() with callback only', function(next){
  request
  .get('/echo-header/accept')
  .set('Accept', 'foo/bar')
  .end(function(err, res){
    assert('foo/bar' == res.text);
    next();
  });
});

it('request .accept() with json', function(next){
  request
  .get('/echo-header/accept')
  .accept('json')
  .end(function(err, res){
    assert('application/json' == res.text);
    next();
  });
});

it('request .accept() with application/json', function(next){
  request
  .get('/echo-header/accept')
  .accept('application/json')
  .end(function(err, res){
    assert('application/json' == res.text);
    next();
  });
});

it('request .accept() with xml', function(next){
  request
  .get('/echo-header/accept')
  .accept('xml')
  .end(function(err, res){
    assert('application/xml' == res.text, res.text);
    next();
  });
});

it('request .accept() with application/xml', function(next){
  request
  .get('/echo-header/accept')
  .accept('application/xml')
  .end(function(err, res){
    assert('application/xml' == res.text);
    next();
  });
});

// FIXME: ie6 will POST rather than GET here due to data(),
//        but I'm not 100% sure why.  Newer IEs are OK.
it('request .end()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
    assert('text/plain' == res.text);
    next();
  });
});

it('request .send()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
    assert('text/plain' == res.text);
    next();
  });
});

it('request .set()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
    assert('text/plain' == res.text);
    next();
  });
});

it('request .set(object)', function(next){
  request
  .get('/echo-header/content-type')
  .set({ 'Content-Type': 'text/plain' })
  .send('wahoo')
  .end(function(err, res){
    assert('text/plain' == res.text);
    next();
  });
});

it('POST urlencoded', function(next){
  request
  .post('/pet')
  .type('urlencoded')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

it('POST json', function(next){
  request
  .post('/pet')
  .type('json')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

it('POST json array', function(next){
  request
  .post('/echo')
  .send([1,2,3])
  .end(function(err, res){
    assert('application/json' == res.header['content-type'].split(';')[0]);
    assert('[1,2,3]' == res.text);
    next();
  });
});

it('POST json default', function(next){
  request
  .post('/pet')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

it('POST json contentType charset', function(next){
  request
  .post('/echo')
  .set('Content-Type', 'application/json; charset=UTF-8')
  .send({ data: ['data1', 'data2'] })
  .end(function(err, res){
    assert('{"data":["data1","data2"]}' == res.text);
    next();
  });
});

it('POST json contentType vendor', function(next){
  request
  .post('/echo')
  .set('Content-Type', 'application/vnd.example+json')
  .send({ data: ['data1', 'data2'] })
  .end(function(err, res){
    assert('{"data":["data1","data2"]}' == res.text);
    next();
  });
});

it('POST multiple .send() calls', function(next){
  request
  .post('/pet')
  .send({ name: 'Manny' })
  .send({ species: 'cat' })
  .end(function(err, res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

it('POST multiple .send() strings', function(next){
  request
  .post('/echo')
  .send('user[name]=tj')
  .send('user[email]=tj@vision-media.ca')
  .end(function(err, res){
    assert('application/x-www-form-urlencoded' == res.header['content-type'].split(';')[0]);
    assert(res.text == 'user[name]=tj&user[email]=tj@vision-media.ca')
    next();
  })
});

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

it('POST with no data', function(next){
  request
    .post('/empty-body')
    .send().end(function(err, res){
      assert.ifError(err);
      assert(res.noContent, 'response should be .noContent');
      next();
    });
});

it('GET .type', function(next){
  request
  .get('/pets')
  .end(function(err, res){
    assert('application/json' == res.type);
    next();
  });
});

it('GET Content-Type params', function(next){
  request
  .get('/text')
  .end(function(err, res){
    assert('utf-8' == res.charset);
    next();
  });
});

it('GET json', function(next){
  request
  .get('/pets')
  .end(function(err, res){
    assert.deepEqual(res.body, ['tobi', 'loki', 'jane']);
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

it('GET x-www-form-urlencoded', function(next){
  request
  .get('/foo')
  .end(function(err, res){
    assert.deepEqual(res.body, { foo: 'bar' });
    next();
  });
});

it('GET shorthand', function(next){
  request.get('/foo', function(err, res){
    assert('foo=bar' == res.text);
    next();
  });
});

it('POST shorthand', function(next){
  request.post('/user/0/pet', { pet: 'tobi' }, function(err, res){
    assert('added pet "tobi"' == res.text);
    next();
  });
});

it('POST shorthand without callback', function(next){
  request.post('/user/0/pet', { pet: 'tobi' }).end(function(err, res){
    assert('added pet "tobi"' == res.text);
    next();
  });
});

it('GET querystring object with array', function(next){
  request
  .get('/querystring')
  .query({ val: ['a', 'b', 'c'] })
  .end(function(err, res){
    assert.deepEqual(res.body, { val: ['a', 'b', 'c'] });
    next();
  });
});

it('GET querystring object with array and primitives', function(next){
  request
  .get('/querystring')
  .query({ array: ['a', 'b', 'c'], string: 'foo', number: 10 })
  .end(function(err, res){
    assert.deepEqual(res.body, { array: ['a', 'b', 'c'], string: 'foo', number: 10 });
    next();
  });
});

it('GET querystring object with two arrays', function(next){
  request
  .get('/querystring')
  .query({ array1: ['a', 'b', 'c'], array2: [1, 2, 3]})
  .end(function(err, res){
    assert.deepEqual(res.body, { array1: ['a', 'b', 'c'], array2: [1, 2, 3]});
    next();
  });
});

it('GET querystring object', function(next){
  request
  .get('/querystring')
  .query({ search: 'Manny' })
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

it('GET querystring append original', function(next){
  request
  .get('/querystring?search=Manny')
  .query({ range: '1..5' })
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5' });
    next();
  });
});

it('GET querystring multiple objects', function(next){
  request
  .get('/querystring')
  .query({ search: 'Manny' })
  .query({ range: '1..5' })
  .query({ order: 'desc' })
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
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

it('GET querystring with strings', function(next){
  request
  .get('/querystring')
  .query('search=Manny')
  .query('range=1..5')
  .query('order=desc')
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
  });
});

it('GET querystring with strings and objects', function(next){
  request
  .get('/querystring')
  .query('search=Manny')
  .query({ order: 'desc', range: '1..5' })
  .end(function(err, res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
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

it('request(method, url)', function(next){
  request('GET', '/foo').end(function(err, res){
    assert('bar' == res.body.foo);
    next();
  });
});

it('request(url)', function(next){
  request('/foo').end(function(err, res){
    assert('bar' == res.body.foo);
    next();
  });
});

it('request(url, fn)', function(next){
  request('/foo', function(err, res){
    assert('bar' == res.body.foo);
    next();
  });
});

it('req.timeout(ms)', function(next){
  request
  .get('/delay/3000')
  .timeout(1000)
  .end(function(err, res){
    assert(err, 'error missing');
    assert(1000 == err.timeout, 'err.timeout missing');
    assert('timeout of 1000ms exceeded' == err.message, 'err.message incorrect');
    assert(null == res);
    next();
  })
})

it('req.timeout(ms) with redirect', function(next) {
  request
  .get('/delay/const')
  .timeout(1000)
  .end(function(err, res) {
    assert(err, 'error missing');
    assert(1000 == err.timeout, 'err.timeout missing');
    assert('timeout of 1000ms exceeded' == err.message, 'err.message incorrect');
    assert(null == res);
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

it('request event', function(next){
  request
  .get('/foo')
  .on('request', function(req){
    assert('/foo' == req.url);
    next();
  })
  .end();
});

it('response event', function(next){
  request
  .get('/foo')
  .on('response', function(res){
    assert('bar' == res.body.foo);
    next();
  })
  .end();
});

it('response should set statusCode', function(next){
  request
    .get('/ok', function(err, res){
      assert(res.statusCode === 200);
      next();
    })
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
