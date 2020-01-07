const request = require('../support/client');
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');

const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
  const cookie = req.header('cookie');
  if (cookie === undefined) {
    res.cookie('test', 1, { maxAge: 900000, httpOnly: true, secure: true });
    res.send('cookie set');
  } else {
    res.send('cookie sent');
  }
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

const agent1 = request.agent();
const agent2 = request.agent({ sendSecureCookie: true });
const agent3 = request.agent();

describe('Secure cookie', () => {
  it('Should receive a secure cookie', () => {
    agent1.get(`${base}/`).then(res => {
      res.should.have.status(200);
      should.exist(res.headers['set-cookie']);
      res.headers['set-cookie'][0].should.containEql('Secure');
      res.text.should.containEql('cookie set');
    });

    agent2.get(`${base}/`).then(res => {
      res.should.have.status(200);
      should.exist(res.headers['set-cookie']);
      res.headers['set-cookie'][0].should.containEql('Secure');
      res.text.should.containEql('cookie set');
    });

    agent3.get(`${base}/`).then(res => {
      res.should.have.status(200);
      should.exist(res.headers['set-cookie']);
      res.headers['set-cookie'][0].should.containEql('Secure');
      res.text.should.containEql('cookie set');
    });
  });

  it('Should send secure cookie on configured agents', () => {
    agent1
      .sendSecureCookie()
      .get(`${base}/`)
      .then(res => {
        res.should.have.status(200);
        should.not.exist(res.headers['set-cookie']);
        res.text.should.containEql('cookie sent');
      });

    agent2.get(`${base}/`).then(res => {
      res.should.have.status(200);
      should.not.exist(res.headers['set-cookie']);
      res.text.should.containEql('cookie sent');
    });
  });

  it('Should not send secure cookie on default agent', () => {
    agent3.get(`${base}/`).then(res => {
      res.should.have.status(200);
      should.exist(res.headers['set-cookie']);
      res.text.should.containEql('cookie set');
    });
  });
});
