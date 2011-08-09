
o = $;

o(run);

var tests = []
  , currentTest;

function run() {
  var start = new Date;
  function next(i) {
    var test = tests[i]
      , testStart = new Date;
    currentTest = test;
    if (!test) return complete(start);
    try {
      if (test.fn.length) {
        test.fn(function(){
          next(++i);
        });
      } else {
        test.fn();
        next(++i);
      }
      passed(test, new Date - testStart);
    } catch (err) {
      failed(test, err);
      throw(err);
    }
  }

  next(0);
}

window.onerror = function(msg){
  failed(currentTest, msg);
};

function complete(start) {
  var duration = new Date - start
    , n = tests.length;

  $('#test-results')
    .append('<p>' + n + ' tests completed in ' + duration + 'ms</p>');
}

function test(label, fn) {
  tests.push({
      label: label
    , fn: fn
  });
}

function passed(test, duration) {
  $('#tests').append('<li class="pass">✓ ' + test.label + ' - <em>' + duration + '</em></li>');
}

function failed(test, err) {
  $('#tests').append('<li class="fail">✖ ' + test.label + ' - ' + err + '</li>');
}

function assert(ok, msg) {
  if (!ok) throw new Error(msg || 'assertion failed');
}

var isArray = Array.isArray ?
  Array.isArray :
  function (v) {
    return Object.prototype.toString.call(v) == '[object Array]';
  };

function eql(a, b) {
  // same object
  if (a === b) return true;

  // different types
  try {
    // Note: this breaks in IE
    if (toString.call(a) != toString.call(b)) return false;
  } catch (e) {
  }

  // array
  if (isArray(a)) {
    // different length
    if (a.length != b.length) return false;

    // different values
    for (var i = 0, len = a.length; i < len; ++i) {
      if (!eql(a[i], b[i])) return false;
    }

    return true;
  }

  // object
  if (Object == a.constructor) {
    var alen = 0
      , blen = 0;

    for (var key in a) ++alen;
    for (var key in b) ++blen;

    // different lengths
    if (alen != blen) return false;

    // different values
    for (var key in a) {
      if (!eql(a[key], b[key])) return false;
    }

    return true;
  }

  return false;
}

assert.eql = function(a, b, msg){
  assert(eql(a, b), msg);
};
