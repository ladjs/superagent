
request = superagent;

test('.version', function(){
  assert(request.version);
});

test('Request inheritance', function(){
  assert(request.get('/') instanceof request.Request);
  assert(request.get('/') instanceof EventEmitter);
});

test('request() simple GET without callback', function(next){
  request('GET', 'test.request.js').end();
  next();
});

test('request() simple GET', function(next){
  request('GET', 'test.request.js').end(function(res){
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
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
  request.post('/todo/item').send('tobi', function(res){
    assert('added "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .type()', function(next){
  request.post('/user/12/pet').type('urlencoded').send('pet=tobi', function(res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .type() with alias', function(next){
  request
  .post('/user/12/pet')
  .type('application/x-www-form-urlencoded')
  .send('pet=tobi', function(res){
    assert('added pet "tobi"' == res.text, 'response text');
    next();
  });
});

test('request .send() with no data or callback', function(next){
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
  .send(function(res){
    assert('foo/bar' == res.text);
    next();
  });
});

// FIXME: ie6 will POST rather than GET here due to data(),
//        but I'm not 100% sure why.  Newer IEs are OK.
test('request .end()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .data('wahoo')
  .end(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('request .data()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .data('wahoo')
  .send(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('request .set()', function(next){
  request
  .get('/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .data('wahoo')
  .send(function(res){
    assert('text/plain' == res.text);
    next();
  });
});

test('POST urlencoded', function(next){
  request
  .post('/pet')
  .type('urlencoded')
  .data({ name: 'Manny', species: 'cat' })
  .send(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST json', function(next){
  request
  .post('/pet')
  .type('json')
  .data({ name: 'Manny', species: 'cat' })
  .send(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('POST json default', function(next){
  request
  .post('/pet')
  .data({ name: 'Manny', species: 'cat' })
  .send(function(res){
    assert('added Manny the cat' == res.text);
    next();
  });
});

test('GET .contentType', function(next){
  request
  .get('/pets')
  .send(function(res){
    assert('application/json' == res.contentType);
    next();
  });
});

test('GET Content-Type params', function(next){
  request
  .get('/pets')
  .send(function(res){
    assert('utf-8' == res.charset);
    next();
  });
});

test('GET json', function(next){
  request
  .get('/pets')
  .send(function(res){
    assert.eql(res.body, ['tobi', 'loki', 'jane']);
    next();
  });
});

test('GET x-www-form-urlencoded', function(next){
  request
  .get('/foo')
  .send(function(res){
    assert.eql(res.body, { foo: 'bar' });
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

test('request X-Requested-With', function(next){
  request
  .get('/echo-header/x-requested-with')
  .send(function(res){
    assert('XMLHttpRequest' == res.text);
    next();
  });
});

test('GET querystring', function(next){
  request
  .get('/querystring')
  .data('search=Manny&range=1..5')
  .end(function(res){
    assert.eql(res.body, { search: 'Manny', range: '1..5' });
    next();
  });
});

test('GET querystring object', function(next){
  request
  .get('/querystring')
  .data({ search: 'Manny' })
  .end(function(res){
    assert.eql(res.body, { search: 'Manny' });
    next();
  });
});

test('GET querystring object .get(uri, obj)', function(next){
  request
  .get('/querystring', { search: 'Manny'})
  .end(function(res){
    assert.eql(res.body, { search: 'Manny' });
    next();
  });
});

