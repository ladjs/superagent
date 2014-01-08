
var assert = require('assert');
var request = require('../');

function serialize(obj, res) {
  var val = request.serializeObject(obj);
  assert(val == res
    , JSON.stringify(obj) + ' to "' + res + '" serialization failed. got: '
    + '"' + val + '"');
}

function parse(str, obj) {
  var val = request.parseString(str);
  assert.deepEqual(val
    , obj
    , '"' + str + '" to '
    + JSON.stringify(obj) + ' parse failed. got: '
    + JSON.stringify(val));
}

test('test .serializeObject() basics', function(){
  serialize('test', 'test');
  serialize('foo=bar', 'foo=bar');
  serialize({ foo: 'bar' }, 'foo=bar');
  serialize({ foo: null }, '');
  serialize({ foo: 'null' }, 'foo=null');
  serialize({ foo: undefined }, '');
  serialize({ foo: 'undefined' }, 'foo=undefined');
  serialize({ name: 'tj', age: 24 }, 'name=tj&age=24');
});

test('test .serializeObject() encoding', function(){
  serialize({ name: '&tj&' }, 'name=%26tj%26');
  serialize({ '&name&': 'tj' }, '%26name%26=tj');
});

test('test .parseString()', function(){
  parse('name=tj', { name: 'tj' });
  parse('name=Manny&species=cat', { name: 'Manny', species: 'cat' });
  parse('redirect=/&ok', { redirect: '/', ok: 'undefined' });
});

test('test .parseString() decoding', function(){
  parse('%26name=tj', { '&name': 'tj' });
  parse('name=tj%26', { name: 'tj&' });
});
