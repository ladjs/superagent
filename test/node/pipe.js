'use strict';
const request = require('../support/client');
const express = require('../support/express');

const app = express();
const fs = require('fs');
const bodyParser = require('body-parser');
let http = require('http');

if (process.env.HTTP2_TEST) {
  http = require('http2');
}

app.use(bodyParser.json());

app.get('/', (req, res) => {
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
});

app.get('/redirect', (req, res) => {
  res.set('Location', '/').sendStatus(302);
});

app.get('/badRedirectNoLocation', (req, res) => {
  res.set('Location', '').sendStatus(302);
});

app.post('/', (req, res) => {
  if (process.env.HTTP2_TEST) {
    // body-parser does not support http2 yet.
    // This section can be remove after body-parser supporting http2.
    res.set('content-type', 'application/json');
    req.pipe(res);
  } else {
    res.send(req.body);
  }
});

let base = 'http://localhost';
let server;
before(function listen(done) {
  server = http.createServer(app);
  server.listen(0, function listening() {
    base += `:${server.address().port}`;
    done();
  });
});

describe('request pipe', () => {
  const destPath = 'test/node/fixtures/tmp.json';

  after(function removeTmpfile(done) {
    fs.unlink(destPath, done);
  });

  it('should act as a writable stream', (done) => {
    const req = request.post(base);
    const stream = fs.createReadStream('test/node/fixtures/user.json');

    req.type('json');

    req.on('response', (res) => {
      res.body.should.eql({ name: 'tobi' });
      done();
    });

    stream.pipe(req);
  });

  it('end() stops piping', (done) => {
    const stream = fs.createWriteStream(destPath);
    request.get(base).end((err, res) => {
      try {
        res.pipe(stream);
        return done(new Error('Did not prevent nonsense pipe'));
      } catch {
        /* expected error */
      }

      done();
    });
  });

  it('should act as a readable stream', (done) => {
    const stream = fs.createWriteStream(destPath);

    let responseCalled = false;
    const req = request.get(base);
    req.type('json');

    req.on('response', (res) => {
      res.status.should.eql(200);
      responseCalled = true;
    });
    stream.on('finish', () => {
      JSON.parse(fs.readFileSync(destPath, 'utf8')).should.eql({
        name: 'tobi'
      });
      responseCalled.should.be.true();
      done();
    });
    req.pipe(stream);
  });

  it('should follow redirects', (done) => {
    const stream = fs.createWriteStream(destPath);

    let responseCalled = false;
    const req = request.get(base + '/redirect');
    req.type('json');

    req.on('response', (res) => {
      res.status.should.eql(200);
      responseCalled = true;
    });
    stream.on('finish', () => {
      JSON.parse(fs.readFileSync(destPath, 'utf8')).should.eql({
        name: 'tobi'
      });
      responseCalled.should.be.true();
      done();
    });
    req.pipe(stream);
  });

  it('should not throw on bad redirects', (done) => {
    const stream = fs.createWriteStream(destPath);

    let responseCalled = false;
    let errorCalled = false;
    const req = request.get(base + '/badRedirectNoLocation');
    req.type('json');

    req.on('response', (res) => {
      responseCalled = true;
    });
    req.on('error', (err) => {
      err.message.should.eql('No location header for redirect');
      errorCalled = true;
      stream.end();
    });
    stream.on('finish', () => {
      responseCalled.should.be.false();
      errorCalled.should.be.true();
      done();
    });
    req.pipe(stream);
  });
});
