'use strict';

const assert = require('assert');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('flags', () => {
  let setup;
  let base;

  before(async () => {
    setup = await getSetup();
    base = setup.uri;
  });

  describe('with 4xx response', () => {
    it('should set res.error and res.clientError', (done) => {
      request.get(`${base}/notfound`).end((error, res) => {
        assert(error);
        assert(!res.ok, 'response should not be ok');
        assert(res.error, 'response should be an error');
        assert(res.clientError, 'response should be a client error');
        assert(!res.serverError, 'response should not be a server error');
        done();
      });
    });
  });

  describe('with 5xx response', () => {
    it('should set res.error and res.serverError', (done) => {
      request.get(`${base}/error`).end((error, res) => {
        assert(error);
        assert(!res.ok, 'response should not be ok');
        assert(!res.notFound, 'response should not be notFound');
        assert(res.error, 'response should be an error');
        assert(!res.clientError, 'response should not be a client error');
        assert(res.serverError, 'response should be a server error');
        done();
      });
    });
  });

  describe('with 404 Not Found', () => {
    it('should res.notFound', (done) => {
      request.get(`${base}/notfound`).end((error, res) => {
        assert(error);
        assert(res.notFound, 'response should be .notFound');
        done();
      });
    });
  });

  describe('with 400 Bad Request', () => {
    it('should set req.badRequest', (done) => {
      request.get(`${base}/bad-request`).end((error, res) => {
        assert(error);
        assert(res.badRequest, 'response should be .badRequest');
        done();
      });
    });
  });

  describe('with 401 Bad Request', () => {
    it('should set res.unauthorized', (done) => {
      request.get(`${base}/unauthorized`).end((error, res) => {
        assert(error);
        assert(res.unauthorized, 'response should be .unauthorized');
        done();
      });
    });
  });

  describe('with 406 Not Acceptable', () => {
    it('should set res.notAcceptable', (done) => {
      request.get(`${base}/not-acceptable`).end((error, res) => {
        assert(error);
        assert(res.notAcceptable, 'response should be .notAcceptable');
        done();
      });
    });
  });

  describe('with 204 No Content', () => {
    it('should set res.noContent', (done) => {
      request.get(`${base}/no-content`).end((error, res) => {
        assert(!error);
        assert(res.noContent, 'response should be .noContent');
        done();
      });
    });
  });

  describe('with 201 Created', () => {
    it('should set res.created', (done) => {
      request.post(`${base}/created`).end((error, res) => {
        assert(!error);
        assert(res.created, 'response should be .created');
        done();
      });
    });
  });

  describe('with 422 Unprocessable Entity', () => {
    it('should set res.unprocessableEntity', (done) => {
      request.post(`${base}/unprocessable-entity`).end((error, res) => {
        assert(error);
        assert(
          res.unprocessableEntity,
          'response should be .unprocessableEntity'
        );
        done();
      });
    });
  });
});
