'use strict';

const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;
const assert = require('assert');
const fs = require('fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

describe('Multipart', () => {
  describe('#field(name, value)', () => {
    it('should set a multipart field value', () => {
      const req = request.post(`${base}/echo`);

      req.field('user[name]', 'tobi');
      req.field('user[age]', '2');
      req.field('user[species]', 'ferret');

      return req.then((res) => {
        res.body['user[name]'].should.equal('tobi');
        res.body['user[age]'].should.equal('2');
        res.body['user[species]'].should.equal('ferret');
      });
    });

    it('should work with file attachments', () => {
      const req = request.post(`${base}/echo`);

      req.field('name', 'Tobi');
      req.attach('document', 'test/node/fixtures/user.html');
      req.field('species', 'ferret');

      return req.then((res) => {
        res.body.name.should.equal('Tobi');
        res.body.species.should.equal('ferret');

        const html = res.files.document;
        html.name.should.equal('user.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');
      });
    });
  });

  describe('#attach(name, path)', () => {
    it('should attach a file', () => {
      const req = request.post(`${base}/echo`);

      req.attach('one', 'test/node/fixtures/user.html');
      req.attach('two', 'test/node/fixtures/user.json');
      req.attach('three', 'test/node/fixtures/user.txt');

      return req.then((res) => {
        const html = res.files.one;
        const json = res.files.two;
        const text = res.files.three;

        html.name.should.equal('user.html');
        html.type.should.equal('text/html');
        read(html.path).should.equal('<h1>name</h1>');

        json.name.should.equal('user.json');
        json.type.should.equal('application/json');
        read(json.path).should.equal('{"name":"tobi"}');

        text.name.should.equal('user.txt');
        text.type.should.equal('text/plain');
        read(text.path).should.equal('Tobi');
      });
    });

    describe('when a file does not exist', () => {
      it('should fail the request with an error', (done) => {
        const req = request.post(`${base}/echo`);

        req.attach('name', 'foo');
        req.attach('name2', 'bar');
        req.attach('name3', 'baz');

        req.end((err, res) => {
          assert.ok(Boolean(err), 'Request should have failed.');
          err.code.should.equal('ENOENT');
          err.message.should.containEql('ENOENT');
          err.path.should.equal('foo');
          done();
        });
      });

      it('promise should fail', () => {
        return request
          .post(`${base}/echo`)
          .field({ a: 1, b: 2 })
          .attach('c', 'does-not-exist.txt')
          .then(
            (res) => assert.fail('It should not allow this'),
            (err) => {
              err.code.should.equal('ENOENT');
              err.path.should.equal('does-not-exist.txt');
            }
          );
      });

      it('should report ECONNREFUSED via the callback', (done) => {
        request
          .post('http://127.0.0.1:1') // nobody is listening there
          .attach('name', 'file-does-not-exist')
          .end((err, res) => {
            assert.ok(Boolean(err), 'Request should have failed');
            err.code.should.equal('ECONNREFUSED');
            done();
          });
      });
      it('should report ECONNREFUSED via Promise', () => {
        return request
          .post('http://127.0.0.1:1') // nobody is listening there
          .attach('name', 'file-does-not-exist')
          .then(
            (res) => assert.fail('Request should have failed'),
            (err) => err.code.should.equal('ECONNREFUSED')
          );
      });
    });
  });

  describe('#attach(name, path, filename)', () => {
    it('should use the custom filename', () =>
      request
        .post(`${base}/echo`)
        .attach('document', 'test/node/fixtures/user.html', 'doc.html')
        .then((res) => {
          const html = res.files.document;
          html.name.should.equal('doc.html');
          html.type.should.equal('text/html');
          read(html.path).should.equal('<h1>name</h1>');
        }));
    it('should fire progress event', (done) => {
      let loaded = 0;
      let total = 0;
      let uploadEventWasFired = false;
      request
        .post(`${base}/echo`)
        .attach('document', 'test/node/fixtures/user.html')
        .on('progress', (event) => {
          total = event.total;
          loaded = event.loaded;
          if (event.direction === 'upload') {
            uploadEventWasFired = true;
          }
        })
        .end((err, res) => {
          if (err) return done(err);
          const html = res.files.document;
          html.name.should.equal('user.html');
          html.type.should.equal('text/html');
          read(html.path).should.equal('<h1>name</h1>');
          total.should.equal(223);
          loaded.should.equal(223);
          uploadEventWasFired.should.equal(true);
          done();
        });
    });
    it('filesystem errors should be caught', (done) => {
      request
        .post(`${base}/echo`)
        .attach('filedata', 'test/node/fixtures/non-existent-file.ext')
        .end((err, res) => {
          assert.ok(Boolean(err), 'Request should have failed.');
          err.code.should.equal('ENOENT');
          err.path.should.equal('test/node/fixtures/non-existent-file.ext');
          done();
        });
    });
  });

  describe('#field(name, val)', () => {
    it('should set a multipart field value', (done) => {
      request
        .post(`${base}/echo`)
        .field('first-name', 'foo')
        .field('last-name', 'bar')
        .end((err, res) => {
          if (err) done(err);
          res.should.be.ok();
          res.body['first-name'].should.equal('foo');
          res.body['last-name'].should.equal('bar');
          done();
        });
    });
  });

  describe('#field(object)', () => {
    it('should set multiple multipart fields', (done) => {
      request
        .post(`${base}/echo`)
        .field({ 'first-name': 'foo', 'last-name': 'bar' })
        .end((err, res) => {
          if (err) done(err);
          res.should.be.ok();
          res.body['first-name'].should.equal('foo');
          res.body['last-name'].should.equal('bar');
          done();
        });
    });
  });
});
