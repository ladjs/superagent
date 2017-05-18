var setup = require('./support/setup');
var uri = setup.uri;
var assert = require('assert');
var request = require('../');

describe('request', function() {
  this.timeout(20000);

it('Request inheritance', function(){
  assert(request.get(uri + '/') instanceof request.Request);
});

it('request() simple GET without callback', function(next){
  request('GET', 'test/test.request.js').end();
  next();
});

it('request() simple GET', function(next){
  request('GET', uri + '/ok').end(function(err, res){
    try {
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(res.text, 'res.text');
    next();
    } catch(e) { next(e); }
  });
});

it('request() simple HEAD', function(next){
  request.head(uri + '/ok').end(function(err, res){
    try {
    assert(res instanceof request.Response, 'respond with Response');
    assert(res.ok, 'response should be ok');
    assert(!res.text, 'res.text');
    next();
    } catch(e) { next(e); }
  });
});


it('request() GET 5xx', function(next){
  request('GET', uri + '/error').end(function(err, res){
    try {
    assert(err);
    assert.equal(err.message, 'Internal Server Error');
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(!res.clientError, 'response should not be a client error');
    assert(res.serverError, 'response should be a server error');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 4xx', function(next){
  request('GET', uri + '/notfound').end(function(err, res){
    try {
    assert(err);
    assert.equal(err.message, 'Not Found');
    assert(!res.ok, 'response should not be ok');
    assert(res.error, 'response should be an error');
    assert(res.clientError, 'response should be a client error');
    assert(!res.serverError, 'response should not be a server error');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 404 Not Found', function(next){
  request('GET', uri + '/notfound').end(function(err, res){
    try {
    assert(err);
    assert(res.notFound, 'response should be .notFound');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 400 Bad Request', function(next){
  request('GET', uri + '/bad-request').end(function(err, res){
    try {
    assert(err);
    assert(res.badRequest, 'response should be .badRequest');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 401 Bad Request', function(next){
  request('GET', uri + '/unauthorized').end(function(err, res){
    try {
    assert(err);
    assert(res.unauthorized, 'response should be .unauthorized');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 406 Not Acceptable', function(next){
  request('GET', uri + '/not-acceptable').end(function(err, res){
    try {
    assert(err);
    assert(res.notAcceptable, 'response should be .notAcceptable');
    next();
    } catch(e) { next(e); }
  });
});

it('request() GET 204 No Content', function(next){
  request('GET', uri + '/no-content').end(function(err, res){
    try {
    assert.ifError(err);
    assert(res.noContent, 'response should be .noContent');
    next();
    } catch(e) { next(e); }
  });
});

it('request() DELETE 204 No Content', function(next){
  request('DELETE', uri + '/no-content').end(function(err, res){
    try {
    assert.ifError(err);
    assert(res.noContent, 'response should be .noContent');
    next();
    } catch(e) { next(e); }
  });
});

it('request() header parsing', function(next){
  request('GET', uri + '/notfound').end(function(err, res){
    try {
    assert(err);
    assert.equal('text/html; charset=utf-8', res.header['content-type']);
    assert.equal('Express', res.header['x-powered-by']);
    next();
    } catch(e) { next(e); }
  });
});

it('request() .status', function(next){
  request('GET', uri + '/notfound').end(function(err, res){
    try {
    assert(err);
    assert.equal(404, res.status, 'response .status');
    assert.equal(4, res.statusType, 'response .statusType');
    next();
    } catch(e) { next(e); }
  });
});

it('get()', function(next){
  request.get( uri + '/notfound').end(function(err, res){
    try {
    assert(err);
    assert.equal(404, res.status, 'response .status');
    assert.equal(4, res.statusType, 'response .statusType');
    next();
    } catch(e) { next(e); }
  });
});


it('put()', function(next){
  request.put(uri + '/user/12').end(function(err, res){
    try {
    assert.equal('updated', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('put().send()', function(next){
  request.put(uri + '/user/13/body').send({user:"new"}).end(function(err, res){
    try {
    assert.equal('received new', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('post()', function(next){
  request.post(uri + '/user').end(function(err, res){
    try {
    assert.equal('created', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('del()', function(next){
  request.del(uri + '/user/12').end(function(err, res){
    try {
    assert.equal('deleted', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('delete()', function(next){
  request.delete(uri + '/user/12').end(function(err, res){
    try {
    assert.equal('deleted', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('post() data', function(next){
  request.post(uri + '/todo/item')
  .type('application/octet-stream')
  .send('tobi')
  .end(function(err, res){
    try {
    assert.equal('added "tobi"', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('request .type()', function(next){
  request
  .post(uri + '/user/12/pet')
  .type('urlencoded')
  .send('pet=tobi')
  .end(function(err, res){
    try {
    assert.equal('added pet "tobi"', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('request .type() with alias', function(next){
  request
  .post(uri + '/user/12/pet')
  .type('application/x-www-form-urlencoded')
  .send('pet=tobi')
  .end(function(err, res){
    try {
    assert.equal('added pet "tobi"', res.text, 'response text');
    next();
    } catch(e) { next(e); }
  });
});

it('request .get() with no data or callback', function(next){
  request.get(uri + '/echo-header/content-type');
  next();
});

it('request .send() with no data only', function(next){
  request.post(uri + '/user/5/pet').type('urlencoded').send('pet=tobi');
  next();
});

it('request .send() with callback only', function(next){
  request
  .get(uri + '/echo-header/accept')
  .set('Accept', 'foo/bar')
  .end(function(err, res){
    try {
    assert.equal('foo/bar', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .accept() with json', function(next){
  request
  .get(uri + '/echo-header/accept')
  .accept('json')
  .end(function(err, res){
    try {
    assert.equal('application/json', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .accept() with application/json', function(next){
  request
  .get(uri + '/echo-header/accept')
  .accept('application/json')
  .end(function(err, res){
    try {
    assert.equal('application/json', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .accept() with xml', function(next){
  request
  .get(uri + '/echo-header/accept')
  .accept('xml')
  .end(function(err, res){
  try {
    assert.equal('application/xml', res.text, res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .accept() with application/xml', function(next){
  request
  .get(uri + '/echo-header/accept')
  .accept('application/xml')
  .end(function(err, res){
  try {
    assert.equal('application/xml', res.text);
    next();
    } catch(e) { next(e); }
  });
});


// FIXME: ie6 will POST rather than GET here due to data(),
//        but I'm not 100% sure why.  Newer IEs are OK.
it('request .end()', function(next){
  request
  .get(uri + '/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
  try {
    assert.equal('text/plain', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .send()', function(next){
  request
  .get(uri + '/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
  try {
    assert.equal('text/plain', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .set()', function(next){
  request
  .get(uri + '/echo-header/content-type')
  .set('Content-Type', 'text/plain')
  .send('wahoo')
  .end(function(err, res){
  try {
    assert.equal('text/plain', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('request .set(object)', function(next){
  request
  .get(uri + '/echo-header/content-type')
  .set({ 'Content-Type': 'text/plain' })
  .send('wahoo')
  .end(function(err, res){
  try {
    assert.equal('text/plain', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST urlencoded', function(next){
  request
  .post(uri + '/pet')
  .type('urlencoded')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
  try {
    assert.equal('added Manny the cat', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST json', function(next){
  request
  .post(uri + '/pet')
  .type('json')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
  try {
    assert.equal('added Manny the cat', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST json array', function(next){
  request
  .post(uri + '/echo')
  .send([1,2,3])
  .end(function(err, res){
  try {
    assert.equal('application/json', res.header['content-type'].split(';')[0]);
    assert.equal('[1,2,3]', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST json default', function(next){
  request
  .post(uri + '/pet')
  .send({ name: 'Manny', species: 'cat' })
  .end(function(err, res){
  try {
    assert.equal('added Manny the cat', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST json contentType charset', function(next){
  request
  .post(uri + '/echo')
  .set('Content-Type', 'application/json; charset=UTF-8')
  .send({ data: ['data1', 'data2'] })
  .end(function(err, res){
  try {
    assert.equal('{"data":["data1","data2"]}', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST json contentType vendor', function(next){
  request
  .post(uri + '/echo')
  .set('Content-Type', 'application/vnd.example+json')
  .send({ data: ['data1', 'data2'] })
  .end(function(err, res){
  try {
    assert.equal('{"data":["data1","data2"]}', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST multiple .send() calls', function(next){
  request
  .post(uri + '/pet')
  .send({ name: 'Manny' })
  .send({ species: 'cat' })
  .end(function(err, res){
  try {
    assert.equal('added Manny the cat', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST multiple .send() strings', function(next){
  request
  .post(uri + '/echo')
  .send('user[name]=tj')
  .send('user[email]=tj@vision-media.ca')
  .end(function(err, res){
  try {
    assert.equal('application/x-www-form-urlencoded', res.header['content-type'].split(';')[0]);
    assert.equal(res.text, 'user[name]=tj&user[email]=tj@vision-media.ca')
    next();
  } catch(e) { next(e); }
  })
});

it('POST with no data', function(next){
  request
    .post(uri + '/empty-body')
    .send().end(function(err, res){
    try {
      assert.ifError(err);
      assert(res.noContent, 'response should be .noContent');
      next();
    } catch(e) { next(e); }
    });
});

it('GET .type', function(next){
  request
  .get(uri + '/pets')
  .end(function(err, res){
  try {
    assert.equal('application/json', res.type);
    next();
    } catch(e) { next(e); }
  });
});

it('GET Content-Type params', function(next){
  request
  .get(uri + '/text')
  .end(function(err, res){
    try {
    assert.equal('utf-8', res.charset);
    next();
    } catch(e) { next(e); }
  });
});

it('GET json', function(next){
  request
  .get(uri + '/pets')
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, ['tobi', 'loki', 'jane']);
    next();
    } catch(e) { next(e); }
  });
});

it('GET x-www-form-urlencoded', function(next){
  request
  .get(uri + '/foo')
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { foo: 'bar' });
    next();
    } catch(e) { next(e); }
  });
});

it('GET shorthand', function(next){
  request.get(uri + '/foo', function(err, res){
    try {
    assert.equal('foo=bar', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST shorthand', function(next){
  request.post(uri + '/user/0/pet', { pet: 'tobi' }, function(err, res){
    try {
    assert.equal('added pet "tobi"', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('POST shorthand without callback', function(next){
  request.post(uri + '/user/0/pet', { pet: 'tobi' }).end(function(err, res){
    try {
    assert.equal('added pet "tobi"', res.text);
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring object with array', function(next){
  request
  .get(uri + '/querystring')
  .query({ val: ['a', 'b', 'c'] })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { val: ['a', 'b', 'c'] });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring object with array and primitives', function(next){
  request
  .get(uri + '/querystring')
  .query({ array: ['a', 'b', 'c'], string: 'foo', number: 10 })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { array: ['a', 'b', 'c'], string: 'foo', number: 10 });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring object with two arrays', function(next){
  request
  .get(uri + '/querystring')
  .query({ array1: ['a', 'b', 'c'], array2: [1, 2, 3]})
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { array1: ['a', 'b', 'c'], array2: [1, 2, 3]});
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring object', function(next){
  request
  .get(uri + '/querystring')
  .query({ search: 'Manny' })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { search: 'Manny' });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring append original', function(next){
  request
  .get(uri + '/querystring?search=Manny')
  .query({ range: '1..5' })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5' });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring multiple objects', function(next){
  request
  .get(uri + '/querystring')
  .query({ search: 'Manny' })
  .query({ range: '1..5' })
  .query({ order: 'desc' })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring with strings', function(next){
  request
  .get(uri + '/querystring')
  .query('search=Manny')
  .query('range=1..5')
  .query('order=desc')
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
    } catch(e) { next(e); }
  });
});

it('GET querystring with strings and objects', function(next){
  request
  .get(uri + '/querystring')
  .query('search=Manny')
  .query({ order: 'desc', range: '1..5' })
  .end(function(err, res){
    try {
    assert.deepEqual(res.body, { search: 'Manny', range: '1..5', order: 'desc' });
    next();
    } catch(e) { next(e); }
  });
});

it('request(method, url)', function(next){
  request('GET', uri + '/foo').end(function(err, res){
    try {
    assert.equal('bar', res.body.foo);
    next();
    } catch(e) { next(e); }
  });
});

it('request(url)', function(next){
  request(uri + '/foo').end(function(err, res){
    try {
    assert.equal('bar', res.body.foo);
    next();
    } catch(e) { next(e); }
  });
});

it('request(url, fn)', function(next){
  request(uri + '/foo', function(err, res){
    try {
    assert.equal('bar', res.body.foo);
    next();
    } catch(e) { next(e); }
  });
});

it('req.timeout(ms)', function(next){
  var req = request
  .get(uri + '/delay/3000')
  .timeout(1000)
  .end(function(err, res){
    try {
    assert(err, 'error missing');
    assert.equal(1000, err.timeout, 'err.timeout missing');
    assert.equal('Timeout of 1000ms exceeded', err.message, 'err.message incorrect');
    assert.equal(null, res);
    assert(req.timedout, true);
    next();
  } catch(e) { next(e); }
  })
})

it('req.timeout(ms) with redirect', function(next) {
  var req = request
  .get(uri + '/delay/const')
  .timeout(1000)
  .end(function(err, res) {
    try {
    assert(err, 'error missing');
    assert.equal(1000, err.timeout, 'err.timeout missing');
    assert.equal('Timeout of 1000ms exceeded', err.message, 'err.message incorrect');
    assert.equal(null, res);
    assert(req.timedout, true);
    next();
    } catch(e) { next(e); }
  });
});


it('request event', function(next){
  request
  .get(uri + '/foo')
  .on('request', function(req){
    try {
    assert.equal(uri + '/foo', req.url);
    next();
    } catch(e) { next(e); }
  })
  .end();
});

it('response event', function(next){
  request
  .get(uri + '/foo')
  .on('response', function(res){
    try {
    assert.equal('bar', res.body.foo);
    next();
    } catch(e) { next(e); }
  })
  .end();
});

it('response should set statusCode', function(next){
  request
    .get(uri + '/ok', function(err, res){
      try {
      assert.strictEqual(res.statusCode, 200);
      next();
      } catch(e) { next(e); }
    })
});

it('req.toJSON()', function(next){
  request
  .get(uri + '/ok')
  .end(function(err, res){
    try {
    var j = (res.request || res.req).toJSON();
    ['url', 'method', 'data', 'headers'].forEach(function(prop){
      assert(j.hasOwnProperty(prop));
    });
    next();
    } catch(e) { next(e); }
  });
});

});
