'use strict';
const request = require('../support/client');
const setup = require('../support/setup');

const base = setup.uri;
const URL = require('url');

describe('Basic auth', () => {
  describe('when credentials are present in url', () => {
    it('should set Authorization', done => {
      const new_url = URL.parse(base);
      new_url.auth = 'tobi:learnboost';
      new_url.pathname = '/basic-auth';

      request.get(URL.format(new_url)).end((err, res) => {
        res.status.should.equal(200);
        done();
      });
    });
  });

  describe('req.auth(user, pass)', () => {
    it('should set Authorization', done => {
      request
        .get(`${base}/basic-auth`)
        .auth('tobi', 'learnboost')
        .end((err, res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  describe('req.auth(user + ":" + pass)', () => {
    it('should set authorization', () =>
      Promise.all([
        request
          .get(`${base}/basic-auth/again`)
          .auth('tobi')
          .then(res => res.status.should.eql(200)),
        request
          .get(`${base}/basic-auth/again`)
          .auth('tobi', undefined)
          .then(res => res.status.should.eql(200))
      ]));
  });
});
