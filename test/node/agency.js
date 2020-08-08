'use strict';

require('should-http');

const express = require('../support/express');

const app = express();
const request = require('../support/client');
const assert = require('assert');
const should = require('should');
const cookieParser = require('cookie-parser');
const session = require('express-session');
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

app.use(cookieParser());
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

app.post('/signin', (req, res) => {
  req.session.user = 'hunter@hunterloftis.com';
  res.redirect('/dashboard');
});

app.post('/setcookie', (req, res) => {
  res.cookie('cookie', 'jar');
  res.sendStatus(200);
});

app.get('/getcookie', (req, res) => {
  res.status(200).send(req.cookies.cookie);
});

app.get('/dashboard', (req, res) => {
  if (req.session.user) return res.status(200).send('dashboard');
  res.status(401).send('dashboard');
});

app.all('/signout', (req, res) => {
  req.session.regenerate(() => {
    res.status(200).send('signout');
  });
});

app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.status(200).send('home');
});

app.post('/redirect', (req, res) => {
  res.redirect('/simple');
});

app.get('/simple', (req, res) => {
  res.status(200).send('simple');
});

let base = 'http://localhost';
let server;
before(function listen(done) {
  server = http.createServer(app);
  server = server.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe('request', () => {
  describe('persistent agent', () => {
    const agent1 = request.agent();
    const agent2 = request.agent();
    const agent3 = request.agent();
    const agent4 = request.agent();

    it('should gain a session on POST', () =>
      agent3.post(`${base}/signin`).then((res) => {
        res.should.have.status(200);
        should.not.exist(res.headers['set-cookie']);
        res.text.should.containEql('dashboard');
      }));

    it('should start with empty session (set cookies)', (done) => {
      agent1.get(`${base}/dashboard`).end((err, res) => {
        should.exist(err);
        res.should.have.status(401);
        should.exist(res.headers['set-cookie']);
        done();
      });
    });

    it('should gain a session (cookies already set)', () =>
      agent1.post(`${base}/signin`).then((res) => {
        res.should.have.status(200);
        should.not.exist(res.headers['set-cookie']);
        res.text.should.containEql('dashboard');
      }));

    it('should persist cookies across requests', () =>
      agent1.get(`${base}/dashboard`).then((res) => {
        res.should.have.status(200);
      }));

    it('should have the cookie set in the end callback', () =>
      agent4
        .post(`${base}/setcookie`)
        .then(() => agent4.get(`${base}/getcookie`))
        .then((res) => {
          res.should.have.status(200);
          assert.strictEqual(res.text, 'jar');
        }));

    it('should not share cookies', (done) => {
      agent2.get(`${base}/dashboard`).end((err, res) => {
        should.exist(err);
        res.should.have.status(401);
        done();
      });
    });

    it('should not lose cookies between agents', () =>
      agent1.get(`${base}/dashboard`).then((res) => {
        res.should.have.status(200);
      }));

    it('should be able to follow redirects', () =>
      agent1.get(base).then((res) => {
        res.should.have.status(200);
        res.text.should.containEql('dashboard');
      }));

    it('should be able to post redirects', () =>
      agent1
        .post(`${base}/redirect`)
        .send({ foo: 'bar', baz: 'blaaah' })
        .then((res) => {
          res.should.have.status(200);
          res.text.should.containEql('simple');
          res.redirects.should.eql([`${base}/simple`]);
        }));

    it('should be able to limit redirects', (done) => {
      agent1
        .get(base)
        .redirects(0)
        .end((err, res) => {
          should.exist(err);
          res.should.have.status(302);
          res.redirects.should.eql([]);
          res.header.location.should.equal('/dashboard');
          done();
        });
    });

    it('should be able to create a new session (clear cookie)', () =>
      agent1.post(`${base}/signout`).then((res) => {
        res.should.have.status(200);
        should.exist(res.headers['set-cookie']);
      }));

    it('should regenerate with an empty session', (done) => {
      agent1.get(`${base}/dashboard`).end((err, res) => {
        should.exist(err);
        res.should.have.status(401);
        should.not.exist(res.headers['set-cookie']);
        done();
      });
    });
  });
});
