const setup = require('./support/setup');

const { uri } = setup;
const assert = require('assert');
const request = require('./support/client');

describe('request', function () {
  this.timeout(20000);

  it('Request inheritance', () => {
    assert(request.get(`${uri}/`) instanceof request.Request);
  });

  it('request() simple GET without callback', (next) => {
    request('GET', 'test/test.request.js').end();
    next();
  });

  it('request() simple GET', (next) => {
    request('GET', `${uri}/ok`).end((err, res) => {
      try {
        assert(res instanceof request.Response, 'respond with Response');
        assert(res.ok, 'response should be ok');
        assert(res.text, 'res.text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() simple HEAD', (next) => {
    request.head(`${uri}/ok`).end((err, res) => {
      try {
        assert(res instanceof request.Response, 'respond with Response');
        assert(res.ok, 'response should be ok');
        assert(!res.text, 'res.text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 5xx', (next) => {
    request('GET', `${uri}/error`).end((err, res) => {
      try {
        assert(err);
        assert.equal(err.message, 'Internal Server Error');
        assert(!res.ok, 'response should not be ok');
        assert(res.error, 'response should be an error');
        assert(!res.clientError, 'response should not be a client error');
        assert(res.serverError, 'response should be a server error');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 4xx', (next) => {
    request('GET', `${uri}/notfound`).end((err, res) => {
      try {
        assert(err);
        assert.equal(err.message, 'Not Found');
        assert(!res.ok, 'response should not be ok');
        assert(res.error, 'response should be an error');
        assert(res.clientError, 'response should be a client error');
        assert(!res.serverError, 'response should not be a server error');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 404 Not Found', (next) => {
    request('GET', `${uri}/notfound`).end((err, res) => {
      try {
        assert(err);
        assert(res.notFound, 'response should be .notFound');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 400 Bad Request', (next) => {
    request('GET', `${uri}/bad-request`).end((err, res) => {
      try {
        assert(err);
        assert(res.badRequest, 'response should be .badRequest');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 401 Bad Request', (next) => {
    request('GET', `${uri}/unauthorized`).end((err, res) => {
      try {
        assert(err);
        assert(res.unauthorized, 'response should be .unauthorized');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 406 Not Acceptable', (next) => {
    request('GET', `${uri}/not-acceptable`).end((err, res) => {
      try {
        assert(err);
        assert(res.notAcceptable, 'response should be .notAcceptable');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() GET 204 No Content', (next) => {
    request('GET', `${uri}/no-content`).end((err, res) => {
      try {
        assert.ifError(err);
        assert(res.noContent, 'response should be .noContent');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() DELETE 204 No Content', (next) => {
    request('DELETE', `${uri}/no-content`).end((err, res) => {
      try {
        assert.ifError(err);
        assert(res.noContent, 'response should be .noContent');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() header parsing', (next) => {
    request('GET', `${uri}/notfound`).end((err, res) => {
      try {
        assert(err);
        assert.equal('text/html; charset=utf-8', res.header['content-type']);
        assert.equal('Express', res.header['x-powered-by']);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request() .status', (next) => {
    request('GET', `${uri}/notfound`).end((err, res) => {
      try {
        assert(err);
        assert.equal(404, res.status, 'response .status');
        assert.equal(4, res.statusType, 'response .statusType');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('get()', (next) => {
    request.get(`${uri}/notfound`).end((err, res) => {
      try {
        assert(err);
        assert.equal(404, res.status, 'response .status');
        assert.equal(4, res.statusType, 'response .statusType');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('put()', (next) => {
    request.put(`${uri}/user/12`).end((err, res) => {
      try {
        assert.equal('updated', res.text, 'response text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('put().send()', (next) => {
    request
      .put(`${uri}/user/13/body`)
      .send({ user: 'new' })
      .end((err, res) => {
        try {
          assert.equal('received new', res.text, 'response text');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('post()', (next) => {
    request.post(`${uri}/user`).end((err, res) => {
      try {
        assert.equal('created', res.text, 'response text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('del()', (next) => {
    request.del(`${uri}/user/12`).end((err, res) => {
      try {
        assert.equal('deleted', res.text, 'response text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('delete()', (next) => {
    request.delete(`${uri}/user/12`).end((err, res) => {
      try {
        assert.equal('deleted', res.text, 'response text');
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('post() data', (next) => {
    request
      .post(`${uri}/todo/item`)
      .type('application/octet-stream')
      .send('tobi')
      .end((err, res) => {
        try {
          assert.equal('added "tobi"', res.text, 'response text');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .type()', (next) => {
    request
      .post(`${uri}/user/12/pet`)
      .type('urlencoded')
      .send('pet=tobi')
      .end((err, res) => {
        try {
          assert.equal('added pet "tobi"', res.text, 'response text');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .type() with alias', (next) => {
    request
      .post(`${uri}/user/12/pet`)
      .type('application/x-www-form-urlencoded')
      .send('pet=tobi')
      .end((err, res) => {
        try {
          assert.equal('added pet "tobi"', res.text, 'response text');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .get() with no data or callback', (next) => {
    request.get(`${uri}/echo-header/content-type`);
    next();
  });

  it('request .send() with no data only', (next) => {
    request.post(`${uri}/user/5/pet`).type('urlencoded').send('pet=tobi');
    next();
  });

  it('request .send() with callback only', (next) => {
    request
      .get(`${uri}/echo-header/accept`)
      .set('Accept', 'foo/bar')
      .end((err, res) => {
        try {
          assert.equal('foo/bar', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .accept() with json', (next) => {
    request
      .get(`${uri}/echo-header/accept`)
      .accept('json')
      .end((err, res) => {
        try {
          assert.equal('application/json', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .accept() with application/json', (next) => {
    request
      .get(`${uri}/echo-header/accept`)
      .accept('application/json')
      .end((err, res) => {
        try {
          assert.equal('application/json', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .accept() with xml', (next) => {
    request
      .get(`${uri}/echo-header/accept`)
      .accept('xml')
      .end((err, res) => {
        try {
          // We can't depend on mime module to be consistent with this
          assert(res.text == 'application/xml' || res.text == 'text/xml');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .accept() with application/xml', (next) => {
    request
      .get(`${uri}/echo-header/accept`)
      .accept('application/xml')
      .end((err, res) => {
        try {
          assert.equal('application/xml', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  // FIXME: ie6 will POST rather than GET here due to data(),
  //        but I'm not 100% sure why.  Newer IEs are OK.
  it('request .end()', (next) => {
    request
      .put(`${uri}/echo-header/content-type`)
      .set('Content-Type', 'text/plain')
      .send('wahoo')
      .end((err, res) => {
        try {
          assert.equal('text/plain', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .send()', (next) => {
    request
      .put(`${uri}/echo-header/content-type`)
      .set('Content-Type', 'text/plain')
      .send('wahoo')
      .end((err, res) => {
        try {
          assert.equal('text/plain', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .set()', (next) => {
    request
      .put(`${uri}/echo-header/content-type`)
      .set('Content-Type', 'text/plain')
      .send('wahoo')
      .end((err, res) => {
        try {
          assert.equal('text/plain', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('request .set(object)', (next) => {
    request
      .put(`${uri}/echo-header/content-type`)
      .set({ 'Content-Type': 'text/plain' })
      .send('wahoo')
      .end((err, res) => {
        try {
          assert.equal('text/plain', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST urlencoded', (next) => {
    request
      .post(`${uri}/pet`)
      .type('urlencoded')
      .send({ name: 'Manny', species: 'cat' })
      .end((err, res) => {
        try {
          assert.equal('added Manny the cat', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST json', (next) => {
    request
      .post(`${uri}/pet`)
      .type('json')
      .send({ name: 'Manny', species: 'cat' })
      .end((err, res) => {
        try {
          assert.equal('added Manny the cat', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST json array', (next) => {
    request
      .post(`${uri}/echo`)
      .send([1, 2, 3])
      .end((err, res) => {
        try {
          assert.equal(
            'application/json',
            res.header['content-type'].split(';')[0]
          );
          assert.equal('[1,2,3]', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST json default', (next) => {
    request
      .post(`${uri}/pet`)
      .send({ name: 'Manny', species: 'cat' })
      .end((err, res) => {
        try {
          assert.equal('added Manny the cat', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST json contentType charset', (next) => {
    request
      .post(`${uri}/echo`)
      .set('Content-Type', 'application/json; charset=UTF-8')
      .send({ data: ['data1', 'data2'] })
      .end((err, res) => {
        try {
          assert.equal('{"data":["data1","data2"]}', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST json contentType vendor', (next) => {
    request
      .post(`${uri}/echo`)
      .set('Content-Type', 'application/vnd.example+json')
      .send({ data: ['data1', 'data2'] })
      .end((err, res) => {
        try {
          assert.equal('{"data":["data1","data2"]}', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST multiple .send() calls', (next) => {
    request
      .post(`${uri}/pet`)
      .send({ name: 'Manny' })
      .send({ species: 'cat' })
      .end((err, res) => {
        try {
          assert.equal('added Manny the cat', res.text);
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST multiple .send() strings', (next) => {
    request
      .post(`${uri}/echo`)
      .send('user[name]=tj')
      .send('user[email]=tj@vision-media.ca')
      .end((err, res) => {
        try {
          assert.equal(
            'application/x-www-form-urlencoded',
            res.header['content-type'].split(';')[0]
          );
          assert.equal(
            res.text,
            'user[name]=tj&user[email]=tj@vision-media.ca'
          );
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('POST with no data', (next) => {
    request
      .post(`${uri}/empty-body`)
      .send()
      .end((err, res) => {
        try {
          assert.ifError(err);
          assert(res.noContent, 'response should be .noContent');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET .type', (next) => {
    request.get(`${uri}/pets`).end((err, res) => {
      try {
        assert.equal('application/json', res.type);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('GET Content-Type params', (next) => {
    request.get(`${uri}/text`).end((err, res) => {
      try {
        assert.equal('utf-8', res.charset);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('GET json', (next) => {
    request.get(`${uri}/pets`).end((err, res) => {
      try {
        assert.deepEqual(res.body, ['tobi', 'loki', 'jane']);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('GET json-seq', (next) => {
    request
      .get(`${uri}/json-seq`)
      .buffer()
      .end((err, res) => {
        try {
          assert.ifError(err);
          assert.deepEqual(res.text, '\u001E{"id":1}\n\u001E{"id":2}\n');
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET x-www-form-urlencoded', (next) => {
    request.get(`${uri}/foo`).end((err, res) => {
      try {
        assert.deepEqual(res.body, { foo: 'bar' });
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('GET shorthand', (next) => {
    request.get(`${uri}/foo`, (err, res) => {
      try {
        assert.equal('foo=bar', res.text);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('POST shorthand', (next) => {
    request.post(`${uri}/user/0/pet`, { pet: 'tobi' }, (err, res) => {
      try {
        assert.equal('added pet "tobi"', res.text);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('POST shorthand without callback', (next) => {
    request.post(`${uri}/user/0/pet`, { pet: 'tobi' }).end((err, res) => {
      try {
        assert.equal('added pet "tobi"', res.text);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('GET querystring object with array', (next) => {
    request
      .get(`${uri}/querystring`)
      .query({ val: ['a', 'b', 'c'] })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, { val: ['a', 'b', 'c'] });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring object with array and primitives', (next) => {
    request
      .get(`${uri}/querystring`)
      .query({ array: ['a', 'b', 'c'], string: 'foo', number: 10 })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, {
            array: ['a', 'b', 'c'],
            string: 'foo',
            number: 10
          });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring object with two arrays', (next) => {
    request
      .get(`${uri}/querystring`)
      .query({ array1: ['a', 'b', 'c'], array2: [1, 2, 3] })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, {
            array1: ['a', 'b', 'c'],
            array2: [1, 2, 3]
          });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring object', (next) => {
    request
      .get(`${uri}/querystring`)
      .query({ search: 'Manny' })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, { search: 'Manny' });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring append original', (next) => {
    request
      .get(`${uri}/querystring?search=Manny`)
      .query({ range: '1..5' })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, { search: 'Manny', range: '1..5' });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring multiple objects', (next) => {
    request
      .get(`${uri}/querystring`)
      .query({ search: 'Manny' })
      .query({ range: '1..5' })
      .query({ order: 'desc' })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, {
            search: 'Manny',
            range: '1..5',
            order: 'desc'
          });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring with strings', (next) => {
    request
      .get(`${uri}/querystring`)
      .query('search=Manny')
      .query('range=1..5')
      .query('order=desc')
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, {
            search: 'Manny',
            range: '1..5',
            order: 'desc'
          });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET querystring with strings and objects', (next) => {
    request
      .get(`${uri}/querystring`)
      .query('search=Manny')
      .query({ order: 'desc', range: '1..5' })
      .end((err, res) => {
        try {
          assert.deepEqual(res.body, {
            search: 'Manny',
            range: '1..5',
            order: 'desc'
          });
          next();
        } catch (err_) {
          next(err_);
        }
      });
  });

  it('GET shorthand payload goes to querystring', (next) => {
    request.get(
      `${uri}/querystring`,
      { foo: 'FOO', bar: 'BAR' },
      (err, res) => {
        try {
          assert.deepEqual(res.body, { foo: 'FOO', bar: 'BAR' });
          next();
        } catch (err_) {
          next(err_);
        }
      }
    );
  });

  it('HEAD shorthand payload goes to querystring', (next) => {
    request.head(
      `${uri}/querystring-in-header`,
      { foo: 'FOO', bar: 'BAR' },
      (err, res) => {
        try {
          assert.deepEqual(JSON.parse(res.headers.query), {
            foo: 'FOO',
            bar: 'BAR'
          });
          next();
        } catch (err_) {
          next(err_);
        }
      }
    );
  });

  it('request(method, url)', (next) => {
    request('GET', `${uri}/foo`).end((err, res) => {
      try {
        assert.equal('bar', res.body.foo);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request(url)', (next) => {
    request(`${uri}/foo`).end((err, res) => {
      try {
        assert.equal('bar', res.body.foo);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request(url, fn)', (next) => {
    request(`${uri}/foo`, (err, res) => {
      try {
        assert.equal('bar', res.body.foo);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('req.timeout(ms)', (next) => {
    const req = request.get(`${uri}/delay/3000`).timeout(1000);
    req.end((err, res) => {
      try {
        assert(err, 'error missing');
        assert.equal(1000, err.timeout, 'err.timeout missing');
        assert.equal(
          'Timeout of 1000ms exceeded',
          err.message,
          'err.message incorrect'
        );
        assert.equal(null, res);
        assert(req.timedout, true);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('req.timeout(ms) with redirect', (next) => {
    const req = request.get(`${uri}/delay/const`).timeout(1000);
    req.end((err, res) => {
      try {
        assert(err, 'error missing');
        assert.equal(1000, err.timeout, 'err.timeout missing');
        assert.equal(
          'Timeout of 1000ms exceeded',
          err.message,
          'err.message incorrect'
        );
        assert.equal(null, res);
        assert(req.timedout, true);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('request event', (next) => {
    request
      .get(`${uri}/foo`)
      .on('request', (req) => {
        try {
          assert.equal(`${uri}/foo`, req.url);
          next();
        } catch (err) {
          next(err);
        }
      })
      .end();
  });

  it('response event', (next) => {
    request
      .get(`${uri}/foo`)
      .on('response', (res) => {
        try {
          assert.equal('bar', res.body.foo);
          next();
        } catch (err) {
          next(err);
        }
      })
      .end();
  });

  it('response should set statusCode', (next) => {
    request.get(`${uri}/ok`, (err, res) => {
      try {
        assert.strictEqual(res.statusCode, 200);
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });

  it('req.toJSON()', (next) => {
    request.get(`${uri}/ok`).end((err, res) => {
      try {
        const j = (res.request || res.req).toJSON();
        ['url', 'method', 'data', 'headers'].forEach((prop) => {
          assert(j.hasOwnProperty(prop));
        });
        next();
      } catch (err_) {
        next(err_);
      }
    });
  });
});
