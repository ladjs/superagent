'use strict';
const fs = require('fs');
const request = require('../support/client');
const getSetup = require('../support/setup');

describe('pipe on redirect', async () => {
  const setup = await getSetup();
  const base = setup.uri;
  const destPath = 'test/node/fixtures/pipe.txt';

  after(function removeTmpfile(done) {
    fs.unlink(destPath, done);
  });

  it('should follow Location', (done) => {
    const stream = fs.createWriteStream(destPath);
    const redirects = [];
    const request_ = request
      .get(base)
      .on('redirect', (res) => {
        redirects.push(res.headers.location);
      })
      .connect({
        inapplicable: 'should be ignored'
      });
    stream.on('finish', () => {
      redirects.should.eql(['/movies', '/movies/all', '/movies/all/0']);
      fs.readFileSync(destPath, 'utf8').should.eql('first movie page');
      done();
    });
    request_.pipe(stream);
  });
});
