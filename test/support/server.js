const fs = require('fs');
let http = require('http');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const basicAuth = require('basic-auth-connect');
const express = require('./express');

let isPseudoHeader;

if (process.env.HTTP2_TEST) {
  http = require('http2');
  const {
    HTTP2_HEADER_AUTHORITY,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_SCHEME,
    HTTP2_HEADER_STATUS
  } = http.constants;
  isPseudoHeader = function (name) {
    switch (name) {
      case HTTP2_HEADER_STATUS: // :status
      case HTTP2_HEADER_METHOD: // :method
      case HTTP2_HEADER_PATH: // :path
      case HTTP2_HEADER_AUTHORITY: // :authority
      case HTTP2_HEADER_SCHEME: // :scheme
        return true;
      default:
        return false;
    }
  };
}

const app = express();

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store');
  next();
});

app.all('/url', (req, res) => {
  res.send(req.url);
});

app.all('/echo', (req, res) => {
  const { headers } = req;
  if (process.env.HTTP2_TEST) {
    Object.keys(headers).forEach((name) => {
      if (isPseudoHeader(name)) {
        delete headers[name];
      }
    });
  }

  res.writeHead(200, headers);
  req.pipe(res);
});

let uniq = 0;
app.all('/unique', (req, res) => {
  res.send(`never the same ${uniq++}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().none());

app.all('/formecho', (req, res) => {
  if (
    !/application\/x-www-form-urlencoded|multipart\/form-data/.test(
      req.headers['content-type']
    )
  ) {
    return res.status(400).end('wrong type');
  }

  res.json(req.body);
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/xdomain', (req, res, next) => {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', req.get('Origin'));
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if (req.method == 'OPTIONS') return res.send(200);
  next();
});

app.get('/xdomain', (req, res) => {
  res.send('tobi');
});

app.get('/login', (req, res) => {
  res.status(200).send('<form id="login"></form>');
});

app.get('/json', (req, res) => {
  res.status(200).json({ name: 'manny' });
});

app.get('/json-hal', (req, res) => {
  res.set('content-type', 'application/hal+json');
  res.send({ name: 'hal 5000' });
});

app.get('/ok', (req, res) => {
  res.send('ok');
});

app.get('/foo', (req, res) => {
  res
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .send('foo=bar');
});

app.get('/form-data', (req, res) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.send('pet[name]=manny');
});

app.post('/movie', (req, res) => {
  res.redirect('/movies/all/0');
});

app.get('/', (req, res) => {
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies');
});

app.get('/movies', (req, res) => {
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all');
});

app.get('/movies/all', (req, res) => {
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', (req, res) => {
  res.set('QUERY', JSON.stringify(req.query));
  res.status(200).send('first movie page');
});

app.get('/movies/random', (req, res) => {
  res.redirect('/movie/4');
});

app.get('/movie/4', (req, res) => {
  setTimeout(() => {
    res.send('not-so-random movie');
  }, 1000);
});

app.get('/links', (req, res) => {
  res.header(
    'Link',
    '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next"'
  );
  res.end();
});

app.get('/xml', (req, res) => {
  res.type('xml');
  res.status(200).send('<some><xml></xml></some>');
});

app.get('/custom', (req, res) => {
  res.type('application/x-custom');
  res.status(200).send('custom stuff');
});

app.put('/user/:id', (req, res) => {
  res.send('updated');
});

app.put('/user/:id/body', (req, res) => {
  res.send(`received ${req.body.user}`);
});

app.patch('/user/:id', (req, res) => {
  res.send('updated');
});

app.post('/user/:id/pet', (req, res) => {
  res.send(`added pet "${req.body.pet}"`);
});

app.post('/user', (req, res) => {
  res.send('created');
});

app.delete('/user/:id', (req, res) => {
  res.send('deleted');
});

app.post('/todo/item', (req, res) => {
  let buf = '';
  req.on('data', (chunk) => {
    buf += chunk;
  });
  req.on('end', () => {
    res.send(`added "${buf}"`);
  });
});

app.get('/delay/const', (req, res) => {
  res.redirect('/delay/3000');
});

app.get('/delay/zip', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip'
  });
  setTimeout(() => {
    res.end();
  }, 10000);
});

app.get('/delay/json', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  setTimeout(() => {
    res.end();
  }, 10000);
});

let slowBodyCallback;
app.get('/delay/slowbody', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

  // Send lots of garbage data to overflow all buffers along the way,
  // so that the browser gets some data before the request is done
  const initialDataSent = new Promise((resolve) => {
    res.write(new Buffer.alloc(4000), () => {
      res.write(new Buffer.alloc(16000));
      resolve();
    });
  });

  // Make sure sending of request body takes over 1s,
  // so that the test can't pass by accident.
  const minimumTime = new Promise((resolve) => {
    setTimeout(resolve, 1001);
  });

  new Promise((resolve) => {
    // Waiting full 10 seconds for the test would be too annoying,
    // so the remote callback is a hack to push the test forward
    slowBodyCallback = resolve;
    setTimeout(resolve, 10000);
  })
    .then(() => Promise.all([initialDataSent, minimumTime]))
    .then(() => {
      res.end('bye');
    });
});

app.get('/delay/slowbody/finish', (req, res) => {
  if (slowBodyCallback) slowBodyCallback();
  res.sendStatus(204);
});

app.get('/delay/:ms', (req, res) => {
  const ms = Math.trunc(req.params.ms);
  setTimeout(() => {
    res.sendStatus(200);
  }, ms);
});

app.get('/querystring', (req, res) => {
  res.send(req.query);
});

app.get('/querystring-in-header', (req, res) => {
  res.set('query', JSON.stringify(req.query));
  res.send();
});

app.all('/echo-header/:field', (req, res) => {
  res.send(req.headers[req.params.field]);
});

app.get('/echo-headers', (req, res) => {
  res.json(req.headers);
});

app.post('/pet', (req, res) => {
  res.send(`added ${req.body.name} the ${req.body.species}`);
});

app.get('/pets', (req, res) => {
  res.send(['tobi', 'loki', 'jane']);
});

app.get('/json-seq', (req, res) => {
  res
    .set('content-type', 'application/json-seq')
    .send('\u001E{"id":1}\n\u001E{"id":2}\n');
});

app.get('/invalid-json', (req, res) => {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(
    ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
  );
});

app.get('/invalid-json-forbidden', (req, res) => {
  res.set('content-type', 'application/json');
  res.status(403).send('Forbidden');
});

app.get('/text', (req, res) => {
  res.send('just some text');
});

app.get('/basic-auth', basicAuth('tobi', 'learnboost'), (req, res) => {
  res.end('you win!');
});

app.get('/basic-auth/again', basicAuth('tobi', ''), (req, res) => {
  res.end('you win again!');
});

app.post('/auth', basicAuth('foo', 'bar'), (req, res) => {
  const auth = req.headers.authorization;
  const parts = auth.split(' ');
  const credentials = Buffer.from(parts[1], 'base64').toString().split(':');
  const user = credentials[0];
  const pass = credentials[1];

  res.send({ user, pass });
});

app.get('/error', (req, res) => {
  res.status(500).send('boom');
});

app.get('/unauthorized', (req, res) => {
  res.sendStatus(401);
});

app.get('/bad-request', (req, res) => {
  res.sendStatus(400);
});

app.get('/not-acceptable', (req, res) => {
  res.sendStatus(406);
});

app.get('/no-content', (req, res) => {
  res.sendStatus(204);
});

app.delete('/no-content', (req, res) => {
  res.set('content-type', 'application/json');
  res.sendStatus(204);
});

app.post('/created', (req, res) => {
  res.status(201).send('created');
});

app.post('/unprocessable-entity', (req, res) => {
  res.status(422).send('unprocessable entity');
});

app.get('/arraybuffer', (req, res) => {
  const content = new ArrayBuffer(1000);
  res.set('Content-Type', 'application/vnd.superagent');
  res.send(content);
});

app.get('/arraybuffer-unauthorized', (req, res) => {
  res.set('Content-Type', 'application/json');
  res
    .status(401)
    .send('{"message":"Authorization has been denied for this request."}');
});

app.post('/empty-body', bodyParser.text(), (req, res) => {
  if (typeof req.body === 'object' && Object.keys(req.body).length === 0) {
    res.sendStatus(204);
  } else {
    res.sendStatus(400);
  }
});

app.get('/collection-json', (req, res) => {
  res.set('content-type', 'application/vnd.collection+json');
  res.send({ name: 'chewbacca' });
});

app.get('/invalid-json', (req, res) => {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(
    ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
  );
});

app.options('/options/echo/body', bodyParser.json(), (req, res) => {
  res.send(req.body);
});

app.get('/cookie-redirect', (req, res) => {
  res.set('Set-Cookie', 'replaced=yes');
  res.append('Set-Cookie', 'from-redir=1', true);
  res.redirect(303, '/show-cookies');
});

app.get('/set-cookie', (req, res) => {
  res.cookie('persist', '123');
  res.send('ok');
});

app.get('/show-cookies', (req, res) => {
  res.set('content-type', 'text/plain');
  res.send(req.headers.cookie);
});

app.put('/redirect-303', (req, res) => {
  res.redirect(303, '/reply-method');
});

app.put('/redirect-307', (req, res) => {
  res.redirect(307, '/reply-method');
});

app.put('/redirect-308', (req, res) => {
  res.redirect(308, '/reply-method');
});

app.all('/reply-method', (req, res) => {
  res.send(`method=${req.method.toLowerCase()}`);
});

app.get('/tobi', (req, res) => {
  res.send('tobi');
});

app.get('/relative', (req, res) => {
  res.redirect('tobi');
});

app.get('/relative/sub', (req, res) => {
  res.redirect('../tobi');
});

app.get('/header', (req, res) => {
  res.redirect('/header/2');
});

app.post('/header', (req, res) => {
  res.redirect('/header/2');
});

app.get('/header/2', (req, res) => {
  res.send(req.headers);
});

app.get('/bad-redirect', (req, res) => {
  res.status(307).end();
});

app.all('/ua', (req, res) => {
  const { headers } = req;
  if (process.env.HTTP2_TEST) {
    Object.keys(headers).forEach((name) => {
      if (isPseudoHeader(name)) {
        delete headers[name];
      }
    });
  }

  res.writeHead(200, headers);
  req.pipe(res);
});

app.get('/manny', (req, res) => {
  res.status(200).json({ name: 'manny' });
});

function serveImageWithType(res, type) {
  const img = fs.readFileSync(`${__dirname}/../node/fixtures/test.png`);
  res.writeHead(200, { 'Content-Type': type });
  res.end(img, 'binary');
}

app.get('/image', (req, res) => {
  serveImageWithType(res, 'image/png');
});
app.get('/image-as-octets', (req, res) => {
  serveImageWithType(res, 'application/octet-stream');
});

app.get('/chunked-json', (req, res) => {
  res.set('content-type', 'application/json');
  res.set('Transfer-Encoding', 'chunked');

  let chunk = 0;
  const interval = setInterval(() => {
    chunk++;
    if (chunk === 1) res.write(`{ "name_${chunk}": "`);
    if (chunk > 1) res.write(`value_${chunk}", "name_${chunk}": "`);
    if (chunk === 10) {
      clearInterval(interval);
      res.write(`value_${chunk}"}`);
      res.end();
    }
  }, 10);
});

app.get('/if-mod', (req, res) => {
  if (req.header('if-modified-since')) {
    res.status(304).end();
  } else {
    res.send(`${Date.now()}`);
  }
});

const called = {};
app.get('/error/ok/:id', (req, res) => {
  if (req.query.qs != 'present') {
    return res.status(400).end('query string lost');
  }

  const { id } = req.params;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.send(req.headers);
    delete called[id];
  }
});

app.get('/delay/:ms/ok/:id', (req, res) => {
  const { id } = req.params;
  if (!called[id]) {
    called[id] = true;
    const ms = Math.trunc(req.params.ms);
    setTimeout(() => {
      res.sendStatus(200);
    }, ms);
  } else {
    res.send(`ok = ${req.url}`);
    delete called[id];
  }
});

app.get('/error/redirect/:id', (req, res) => {
  const { id } = req.params;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.redirect('/movies');
    delete called[id];
  }
});

app.get('/error/redirect-error:id', (req, res) => {
  const { id } = req.params;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.redirect('/error');
    delete called[id];
  }
});

const server = http.createServer(app);
server.listen(process.env.ZUUL_PORT);
