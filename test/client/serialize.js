var assert = require('assert');

var request = require('../../');

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

describe('request.serializeObject()', function(){
  it('should serialize', function() {
    serialize('test', 'test');
    serialize('foo=bar', 'foo=bar');
    serialize({ foo: 'bar' }, 'foo=bar');
    serialize({ foo: null }, 'foo=');
    serialize({ foo: 'null' }, 'foo=null');
    serialize({ foo: undefined }, '');
    serialize({ foo: 'undefined' }, 'foo=undefined');
    serialize({ name: 'tj', age: 24 }, 'name=tj&age=24');
    serialize({ name: '&tj&' }, 'name=%26tj%26');
    serialize({ '&name&': 'tj' }, '%26name%26=tj');
    serialize({foo:{bar: {baz: 100}}}, "foo%5Bbar%5D%5Bbaz%5D=100");
    serialize({foo:{bar: 1, baz: 2}}, "foo%5Bbar%5D=1&foo%5Bbaz%5D=2");
  });
});

describe('request.parseString()', function(){
  it('should parse', function() {
    parse('name=tj', { name: 'tj' });
    parse('name=Manny&species=cat', { name: 'Manny', species: 'cat' });
    parse('redirect=/&ok', { redirect: '/', ok: '' });
    parse('%26name=tj', { '&name': 'tj' });
    parse('name=tj%26', { name: 'tj&' });
    parse("foo%5Bbar%5D%5Bbaz%5D=100", {foo:{bar: {baz: 100}}});
    parse("foo%5Bbar%5D=1&foo%5Bbaz%5D=2", {foo:{bar: 1, baz: 2}});
  });
});
