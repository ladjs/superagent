'use strict';
const URL = require('url');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('Basic auth', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('when credentials are present in url', () => {
    it('should set Authorization', (done) => {
      const new_url = URL.parse(base);
      new_url.auth = 'tobi:learnboost';
      new_url.pathname = '/basic-auth';

      request.get(URL.format(new_url)).end((error, res) => {
        res.status.should.equal(200);
        done();
      });
    });
  });

  describe('req.auth(user, pass)', () => {
    it('should set Authorization', (done) => {
      request
        .get(`${base}/basic-auth`)
        .auth('tobi', 'learnboost')
        .end((error, res) => {
          res.status.should.equal(200);
          done();
        });
    });
  });

  describe('req.auth(user + ":" + pass)', () => {
    it('should set authorization', (done) => {
      request
        .get(`${base}/basic-auth/again`)
        .auth('tobi')
        .end((error, res) => {
          res.status.should.eql(200);
          done();
        });
    });
  });
});
