'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const should = require('should');
const getPort = require('get-port');
const request = require('../support/client');
const getSetup = require('../support/setup');
const IS_WINDOWS = require('os').platform() === 'win32';

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function getFullPath(filename) {
  if (!IS_WINDOWS) {
    return filename;
  }

  const fullPath = path.join(__dirname, '../../', filename);
  return fullPath;
}

describe('Multipart', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('#field(name, value)', () => {
    it('should set a multipart field value', () => {
      const request_ = request.post(`${base}/echo`);

      request_.field('user[name]', 'tobi');
      request_.field('user[age]', '2');
      request_.field('user[species]', 'ferret');

      return request_.then((res) => {
        res.body['user[name]'].should.equal('tobi');
        res.body['user[age]'].should.equal('2');
        res.body['user[species]'].should.equal('ferret');
      });
    });

    it('should work with file attachments', () => {
      const request_ = request.post(`${base}/echo`);

      request_.field('name', 'Tobi');
      request_.attach('document', 'test/node/fixtures/user.html');
      request_.field('species', 'ferret');

      return request_.then((res) => {
        res.body.name.should.equal('Tobi');
        res.body.species.should.equal('ferret');

        const html = res.files.document;
        html.originalFilename.should.equal('user.html');
        html.mimetype.should.equal('text/html');
        read(html.filepath).should.equal('<h1>name</h1>');
      });
    });
  });

  describe('#attach(name, path)', () => {
    it('should attach a file', () => {
      const request_ = request.post(`${base}/echo`);

      request_.attach('one', 'test/node/fixtures/user.html');
      request_.attach('two', 'test/node/fixtures/user.json');
      request_.attach('three', 'test/node/fixtures/user.txt');

      return request_.then((res) => {
        const html = res.files.one;
        const json = res.files.two;
        const text = res.files.three;

        html.originalFilename.should.equal('user.html');
        html.mimetype.should.equal('text/html');
        read(html.filepath).should.equal('<h1>name</h1>');

        json.originalFilename.should.equal('user.json');
        json.mimetype.should.equal('application/json');
        read(json.filepath).should.equal('{"name":"tobi"}');

        text.originalFilename.should.equal('user.txt');
        text.mimetype.should.equal('text/plain');
        read(text.filepath).should.equal('Tobi');
      });
    });

    describe('when a file does not exist', () => {
      it('should fail the request with an error', (done) => {
        const request_ = request.post(`${base}/echo`);

        request_.attach('name', 'foo');
        // request_.attach('name2', 'bar');
        // request_.attach('name3', 'baz');

        request_.end((error, res) => {
          assert.ok(Boolean(error), 'Request should have failed.');
          error.code.should.equal('ENOENT');
          error.message.should.containEql('ENOENT');
          if (IS_WINDOWS) {
            error.path.toLowerCase().should.equal(
              getFullPath('foo').toLowerCase()
            );
          } else {
            error.path.should.equal(getFullPath('foo'));
          }

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
              if (IS_WINDOWS) {
                err.path.toLowerCase().should.equal(
                  getFullPath('does-not-exist.txt').toLowerCase()
                );
              } else {
                err.path.should.equal(getFullPath('does-not-exist.txt'));
              }

            }
          );
      });

      it('should report ENOENT via the callback', (done) => {
        request
          .post(`${base}/echo`)
          .attach('name', 'file-does-not-exist')
          .end((error, res) => {
            assert.ok(Boolean(error), 'Request should have failed');
            error.code.should.equal('ENOENT');
            done();
          });
      });

      it('should report ENOENT via Promise', () => {
        return request
          .post(`${base}/echo`)
          .attach('name', 'file-does-not-exist')
          .then(
            (res) => assert.fail('Request should have failed'),
            (err) => err.code.should.equal('ENOENT')
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
          html.originalFilename.should.equal('doc.html');
          html.mimetype.should.equal('text/html');
          read(html.filepath).should.equal('<h1>name</h1>');
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
        .end((error, res) => {
          if (error) return done(error);
          const html = res.files.document;
          html.originalFilename.should.equal('user.html');
          html.mimetype.should.equal('text/html');
          read(html.filepath).should.equal('<h1>name</h1>');
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
        .end((error, res) => {
          assert.ok(Boolean(error), 'Request should have failed.');
          error.code.should.equal('ENOENT');
          if (IS_WINDOWS) {
            error.path.toLowerCase().should.equal(
              getFullPath('test/node/fixtures/non-existent-file.ext').toLowerCase()
            );
          } else {
            error.path.should.equal(
              getFullPath('test/node/fixtures/non-existent-file.ext')
            );
          }

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
        .end((error, res) => {
          if (error) done(error);
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
        .end((error, res) => {
          if (error) done(error);
          res.should.be.ok();
          res.body['first-name'].should.equal('foo');
          res.body['last-name'].should.equal('bar');
          done();
        });
    });
  });
});
