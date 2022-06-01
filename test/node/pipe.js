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

app.get('/', (request_, res) => {
  fs.createReadStream('test/node/fixtures/user.json').pipe(res);
});

app.get('/redirect', (request_, res) => {
  res.set('Location', '/').sendStatus(302);
});

app.get('/badRedirectNoLocation', (request_, res) => {
  res.set('Location', '').sendStatus(302);
});

app.post('/', (request_, res) => {
  if (process.env.HTTP2_TEST) {
    // body-parser does not support http2 yet.
    // This section can be remove after body-parser supporting http2.
    res.set('content-type', 'application/json');
    request_.pipe(res);
  } else {
    res.send(request_.body);
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
  const destinationPath = 'test/node/fixtures/tmp.json';

  after(function removeTmpfile(done) {
    fs.unlink(destinationPath, done);
  });

  it('should act as a writable stream', (done) => {
    const request_ = request.post(base);
    const stream = fs.createReadStream('test/node/fixtures/user.json');

    request_.type('json');

    request_.on('response', (res) => {
      res.body.should.eql({ name: 'tobi' });
      done();
    });

    stream.pipe(request_);
  });

  it('end() stops piping', (done) => {
    const stream = fs.createWriteStream(destinationPath);
    request.get(base).end((error, res) => {
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
    const stream = fs.createWriteStream(destinationPath);

    let responseCalled = false;
    const request_ = request.get(base);
    request_.type('json');

    request_.on('response', (res) => {
      res.status.should.eql(200);
      responseCalled = true;
    });
    stream.on('finish', () => {
      JSON.parse(fs.readFileSync(destinationPath)).should.eql({
        name: 'tobi'
      });
      responseCalled.should.be.true();
      done();
    });
    request_.pipe(stream);
  });

  it('should follow redirects', (done) => {
    const stream = fs.createWriteStream(destinationPath);

    let responseCalled = false;
    const request_ = request.get(base + '/redirect');
    request_.type('json');

    request_.on('response', (res) => {
      res.status.should.eql(200);
      responseCalled = true;
    });
    stream.on('finish', () => {
      JSON.parse(fs.readFileSync(destinationPath)).should.eql({
        name: 'tobi'
      });
      responseCalled.should.be.true();
      done();
    });
    request_.pipe(stream);
  });

  it('should not throw on bad redirects', (done) => {
    const stream = fs.createWriteStream(destinationPath);

    let responseCalled = false;
    let errorCalled = false;
    const request_ = request.get(base + '/badRedirectNoLocation');
    request_.type('json');

    request_.on('response', (res) => {
      responseCalled = true;
    });
    request_.on('error', (error) => {
      error.message.should.eql('No location header for redirect');
      errorCalled = true;
      stream.end();
    });
    stream.on('finish', () => {
      responseCalled.should.be.false();
      errorCalled.should.be.true();
      done();
    });
    request_.pipe(stream);
  });
});
