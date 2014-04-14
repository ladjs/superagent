
var assert = require('assert');
var request = require('../');

test('Request inheritance', function(){
  assert(request.get('/') instanceof request.Request);
});

test('request() simple GET without callback', function(next){
  request('GET', 'test/test.request.js').end();
  next();
});

test('request() simple GET', function(next){
  request('GET', 'test/test.request.js').end(function(res){
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(res.text, 'res.text');
    next();
  });
});

test('request() simple HEAD', function(next){
  request.head('test/test.request.js').end(function(res){
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(!res.text, 'res.text');
    next();
  });
});

test('request() error object', function(next) {
  request('GET', '/error').end(function(res) {
    assert(res.error, 'response should be an error');
    assert(res.error.message == 'cannot GET /error (500)');
    assert(res.error.status == 500);
    assert(res.error.method == 'GET');
    assert(res.error.url == '/error');
    next();
  });
});

test('request() GET 5xx', function(next){
  request('GET', '/error').end(function(res){
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(!res.clientError, 'response should not be a client error');
    assert(res.serverError, 'response should be a server error');
    next();
  });
});

test('request() GET 4xx', function(next){
  request('GET', '/notfound').end(function(res){
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(res.clientError, 'response should be a client error');
    assert(!res.serverError, 'response should not be a server error');
    next();
  });
});

test('request() GET 404 Not Found', function(next){
  request('GET', '/notfound').end(function(res){
    assert(res.notFound, 'response should be .notFound');
    next();
  });
});

test('request() GET 400 Bad Request', function(next){
  request('GET', '/bad-request').end(function(res){
    assert(res.badRequest, 'response should be .badRequest');
    next();
  });
});

test('request() GET 401 Bad Request', function(next){
  request('GET', '/unauthorized').end(function(res){
    assert(res.unauthorized, 'response should be .unauthorized');
    next();
  });
});

test('request() GET 406 Not Acceptable', function(next){
  request('GET', '/not-acceptable').end(function(res){
    assert(res.notAcceptable, 'response should be .notAcceptable');
    next();
  });
});

test('request() GET 204 No Content', function(next){
  request('GET', '/no-content').end(function(res){
    assert(res.noContent, 'response should be .noContent');
    next();
  });
});

test('request() header parsing', function(next){
  request('GET', '/notfound').end(function(res){
    assert('text/plain' == res.header['content-type']);
    assert('Express' == res.header['x-powered-by']);
    next();
  });
});

test('request() .status', function(next){
  request('GET', '/notfound').end(function(res){
    assert(404 == res.status, 'response .status');
    assert(4 == res.statusType, 'response .statusType');
    next();
  });
});

test('get()', function(next){
  request.get('/notfound').end(function(res){
    assert(404 == res.status, 'response .status');
    assert(4 == res.statusType, 'response .statusType');
    next();
  });
});

test('patch()', function(next){
  request.patch('/user/12').end(function(res){
    assert('updated' == res.text, 'response text');
    next();
  });
});

test('put()', function(next){
  request.put('/user/12').end(function(res){
    assert('updated' == res.text, 'response text');
    next();
  });
});

test('post()', function(next){
  request.post('/user').end(function(res){
    assert('created' == res.text, 'response text');
    next();
  });
});

test('del()', function(next){
  request.del('/user/12').end(function(res){
    assert('deleted' == res.text, 'response text');
    next();
  });
});

test('post() data', function(next){
  request.post('/todo/item')
  .type('application/octet-stream')
  .send('tobi')
  .end(function(res){
    assert('added "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .type()', function(next){
  request
  .post('/user/12/pet')
  .type('urlencoded')
  .send('pet=tobi')
  .end(function(res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .type() with alias', function(next){
  request
  .post('/user/12/pet')
  .type('application/x-www-form-urlencoded')
  .send('pet=tobi')
  .end(function(res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .get() with no data or callback', function(next){
  request.get('/echo-header/content-type');
  next();
});

test('request .send() with no data only', function(next){
  request.post('/user/5/pet').type('urlencoded').send('pet=tobi');
  next();
});

test('request .send() with callback only', function(next){
  request
  .get('/echo-header/accept')
  .set('Accept', 'foo/bar')
  .end(function(res){
    assert('foo/bar' == res.text);
    next();
  });
});

test('request .accept() with json', function(next){
  request
  .get('/echo-header/accept')
  .accept('json')
  .end(function(res){
    assert('application/json' == res.text);
    next();
  });
});

test('request .accept() with application/json', function(next){
  request
  .get('/echo-header/accept')
  .accept('application/json')
  .end(function(res){
    assert('application/json' == res.text);
    next();
  });
});

test('request .accept() with xml', function(next){
  request
  .get('/echo-header/accept')
  .accept('xml')
  .end(function(res){
    assert('application/xml' == res.text);
    next();
  });
});

test('request .accept() with application/xml', function(next){
  request
  .get('/echo-header/accept')
  .accept('application/xml')
  .end(function(res){
    assert('application/xml' == res.text);
    next();
  });
});

// FIXME: ie6 will POST rather than GET here due to data(),
//        but I'm not 100% sure why.  Newer IEs are OK.
test('request .end()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('request .send()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('request .set()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('request .set(object)', function(next){
  request
  .get('/echo-header/content-type')
  .set({ 'Content-Type': 'text/plain' })
  .send('wahoo')
  .end(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('POST urlencoded', function(next){
  request
  .post('/pet')
  .type('urlencoded')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST json', function(next){
  request
  .post('/pet')
  .type('json')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST json array', function(next){
  request
  .post('/echo')
  .send([1,2,3])
  .end(function(res){
    assert('application/json' == res.header['content-type'].split(';')[0]);
    assert('[1,2,3]' == res.text);
    next();
  });
});

test('POST json default', function(next){
  request
  .post('/pet')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST multiple .send() calls', function(next){
  request
  .post('/pet')
  .send({ name: 'Manny' })
  .send({ species: 'cat' })
  .end(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST multiple .send() strings', function(next){
  request
  .post('/echo')
  .send('user[name]=tj')
  .send('user[email]=tj@vision-media.ca')
  .end(function(res){
    assert('application/x-www-form-urlencoded' == res.header['content-type'].split(';')[0]);
    assert(res.text == 'user[name]=tj&user[email]=tj@vision-media.ca')
    next();
  })
});

test('GET .type', function(next){
  request
  .get('/pets')
  .end(function(res){
    assert('application/json' == res.type);
    next();
  });
});

test('GET Content-Type params', function(next){
  request
  .get('/text')
  .end(function(res){
    assert('utf-8' == res.charset);
    next();
  });
});

test('GET json', function(next){
  request
  .get('/pets')
  .end(function(res){
    assert.deepEqual(res.body, ['tobi', 'loki', 'jane']);
    next();
  });
});

test('GET x-www-form-urlencoded', function(next){
  request
  .get('/foo')
  .end(function(res){
    assert.deepEqual(res.body, { foo: 'bar' });
    next();
  });
});

test('GET shorthand', function(next){
  request.get('/foo', function(res){
    assert('foo=bar' == res.text);
    next();
  });
});

test('POST shorthand', function(next){
  request.post('/user/0/pet', { pet: 'tobi' }, function(res){
    assert('added pet "tobi"' == res.text);
    next();
  });
});

test('POST shorthand without callback', function(next){
  request.post('/user/0/pet', { pet: 'tobi' }).end(function(res){
    assert('added pet "tobi"' == res.text);
    next();
  });
});

test('GET querystring object', function(next){
  request
  .get('/querystring')
  .query({ search: 'Manny' })
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

test('GET querystring append original', function(next){
  request
  .get('/querystring?search=Manny')
  .query({ range: '1..5' })
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5' });
    next();
  });
});

test('GET querystring multiple objects', function(next){
  request
  .get('/querystring')
  .query({ search: 'Manny' })
  .query({ range: '1..5' })
  .query({ order: 'desc' })
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
  });
});

test('GET querystring empty objects', function(next){
  var req = request
  .get('/querystring')
  .query({})
  .end(function(res){
    assert.deepEqual(req._query, []);
    assert.deepEqual(res.body, {});
    next();
  });
});

test('GET querystring with strings', function(next){
  request
  .get('/querystring')
  .query('search=Manny')
  .query('range=1..5')
  .query('order=desc')
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
  });
});

test('GET querystring with strings and objects', function(next){
  request
  .get('/querystring')
  .query('search=Manny')
  .query({ order: 'desc', range: '1..5' })
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
  });
});

test('GET querystring object .get(uri, obj)', function(next){
  request
  .get('/querystring', { search: 'Manny' })
  .end(function(res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

test('GET querystring object .get(uri, obj, fn)', function(next){
  request
  .get('/querystring', { search: 'Manny'}, function(res){
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
  });
});

test('request(method, url)', function(next){
  request('GET', '/foo').end(function(res){
    assert('bar' == res.body.foo);
    next();
  });
});

test('request(url)', function(next){
  request('/foo').end(function(res){
    assert('bar' == res.body.foo);
    next();
  });
});

test('request(url, fn)', function(next){
  request('/foo', function(res){
    assert('bar' == res.body.foo);
    next();
  });
});

test('req.timeout(ms)', function(next){
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

test('basic auth', function(next){
  request
  .post('/auth')
  .auth('foo', 'bar')
  .end(function(res){
    assert('foo' == res.body.user);
    assert('bar' == res.body.pass);
    next();
  });
});
