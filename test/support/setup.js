require('should');
require('should-http');

const getPort = require('get-port');

let NODE;
let uri;

async function getSetup() {
  if (NODE && uri) {
    return { NODE, uri };
  }

  NODE = true;
  if (typeof window === 'undefined') {
    try {
      const port = await getPort();

      // check that another call to the function hasn't set the uri already
      if (!uri) {
        process.env.ZUUL_PORT = port;
        uri = `http://localhost:${process.env.ZUUL_PORT}`;
        require('./server');
      }
    } catch (err) {
      console.error(err);
    }
  } else {
    NODE = false;
    uri = `//${window.location.host}`;
  }

  return { NODE, uri };
}

module.exports = getSetup;
