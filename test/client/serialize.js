var assert = require('assert');

var request = require('../../');

function serialize(obj, res) {
  var val = request.serializeObject(obj);
  assert.equal(val, res
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
    serialize({ foo: null }, 'foo');
    serialize({ foo: 'null' }, 'foo=null');
    serialize({ foo: undefined }, '');
    serialize({ foo: 'undefined' }, 'foo=undefined');
    serialize({ name: 'tj', age: 24 }, 'name=tj&age=24');
    serialize({ name: '&tj&' }, 'name=%26tj%26');
    serialize({ '&name&': 'tj' }, '%26name%26=tj');
  });
});

describe('request.parseString()', function(){
  it('should parse', function() {
    parse('name=tj', { name: 'tj' });
    parse('name=Manny&species=cat', { name: 'Manny', species: 'cat' });
    parse('redirect=/&ok', { redirect: '/', ok: '' });
    parse('%26name=tj', { '&name': 'tj' });
    parse('name=tj%26', { name: 'tj&' });
  });
});

describe('Merging objects', function(){
  it('Don\'t mix FormData and JSON', function(){
    if (!window.FormData) {
      // Skip test if FormData is not supported by browser
      return;
    }

    var data = new FormData();
    data.append('foo', 'bar');

    assert.throws(function(){
      request
        .post('/echo')
        .send(data)
        .send({allowed:false})
    });
  });

  it('Don\'t mix Blob and JSON', function(){
    if (!window.Blob) {
      return;
    }

    request
      .post('/echo')
      .send(new Blob(["will be cleared"]))
      .send(false)
      .send({allowed:true});

    assert.throws(function(){
      request
        .post('/echo')
        .send(new Blob(["hello"]))
        .send({allowed:false})
    });
  });
});
