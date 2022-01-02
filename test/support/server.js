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

app.use((request, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store');
  next();
});

app.all('/url', (request, res) => {
  res.send(request.url);
});

app.all('/echo', (request, res) => {
  const { headers } = request;
  if (process.env.HTTP2_TEST) {
    for (const name of Object.keys(headers)) {
      if (isPseudoHeader(name)) {
        delete headers[name];
      }
    }
  }

  res.writeHead(200, headers);
  request.pipe(res);
});

let uniq = 0;
app.all('/unique', (request, res) => {
  res.send(`never the same ${uniq++}`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().none());

app.all('/formecho', (request, res) => {
  if (
    !/application\/x-www-form-urlencoded|multipart\/form-data/.test(
      request.headers['content-type']
    )
  ) {
    return res.status(400).end('wrong type');
  }

  res.json(request.body);
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/xdomain', (request, res, next) => {
  if (!request.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', request.get('Origin'));
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if (request.method == 'OPTIONS') return res.send(200);
  next();
});

app.get('/xdomain', (request, res) => {
  res.send('tobi');
});

app.get('/login', (request, res) => {
  res.status(200).send('<form id="login"></form>');
});

app.get('/json', (request, res) => {
  res.status(200).json({ name: 'manny' });
});

app.get('/json-hal', (request, res) => {
  res.set('content-type', 'application/hal+json');
  res.send({ name: 'hal 5000' });
});

app.get('/ok', (request, res) => {
  res.send('ok');
});

app.get('/foo', (request, res) => {
  res
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .send('foo=bar');
});

app.get('/form-data', (request, res) => {
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.send('pet[name]=manny');
});

app.post('/movie', (request, res) => {
  res.redirect('/movies/all/0');
});

app.get('/', (request, res) => {
  res.set('QUERY', JSON.stringify(request.query));
  res.redirect('/movies');
});

app.get('/movies', (request, res) => {
  res.set('QUERY', JSON.stringify(request.query));
  res.redirect('/movies/all');
});

app.get('/movies/all', (request, res) => {
  res.set('QUERY', JSON.stringify(request.query));
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', (request, res) => {
  res.set('QUERY', JSON.stringify(request.query));
  res.status(200).send('first movie page');
});

app.get('/movies/random', (request, res) => {
  res.redirect('/movie/4');
});

app.get('/movie/4', (request, res) => {
  setTimeout(() => {
    res.send('not-so-random movie');
  }, 1000);
});

app.get('/links', (request, res) => {
  res.header(
    'Link',
    '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next"'
  );
  res.end();
});

app.get('/xml', (request, res) => {
  res.type('xml');
  res.status(200).send('<some><xml></xml></some>');
});

app.get('/custom', (request, res) => {
  res.type('application/x-custom');
  res.status(200).send('custom stuff');
});

app.put('/user/:id', (request, res) => {
  res.send('updated');
});

app.put('/user/:id/body', (request, res) => {
  res.send(`received ${request.body.user}`);
});

app.patch('/user/:id', (request, res) => {
  res.send('updated');
});

app.post('/user/:id/pet', (request, res) => {
  res.send(`added pet "${request.body.pet}"`);
});

app.post('/user', (request, res) => {
  res.send('created');
});

app.delete('/user/:id', (request, res) => {
  res.send('deleted');
});

app.post('/todo/item', (request, res) => {
  let buf = '';
  request.on('data', (chunk) => {
    buf += chunk;
  });
  request.on('end', () => {
    res.send(`added "${buf}"`);
  });
});

app.get('/delay/const', (request, res) => {
  res.redirect('/delay/3000');
});

app.get('/delay/zip', (request, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Encoding': 'gzip'
  });
  setTimeout(() => {
    res.end();
  }, 10_000);
});

app.get('/delay/json', (request, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  setTimeout(() => {
    res.end();
  }, 10_000);
});

let slowBodyCallback;
app.get('/delay/slowbody', (request, res) => {
  res.writeHead(200, { 'Content-Type': 'application/octet-stream' });

  // Send lots of garbage data to overflow all buffers along the way,
  // so that the browser gets some data before the request is done
  const initialDataSent = new Promise((resolve) => {
    res.write(new Buffer.alloc(4000), () => {
      res.write(new Buffer.alloc(16_000));
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
    setTimeout(resolve, 10_000);
  })
    .then(() => Promise.all([initialDataSent, minimumTime]))
    .then(() => {
      res.end('bye');
    });
});

app.get('/delay/slowbody/finish', (request, res) => {
  if (slowBodyCallback) slowBodyCallback();
  res.sendStatus(204);
});

app.get('/delay/:ms', (request, res) => {
  const ms = Math.trunc(request.params.ms);
  setTimeout(() => {
    res.sendStatus(200);
  }, ms);
});

app.get('/querystring', (request, res) => {
  res.send(request.query);
});

app.get('/querystring-in-header', (request, res) => {
  res.set('query', JSON.stringify(request.query));
  res.send();
});

app.all('/echo-header/:field', (request, res) => {
  res.send(request.headers[request.params.field]);
});

app.get('/echo-headers', (request, res) => {
  res.json(request.headers);
});

app.post('/pet', (request, res) => {
  res.send(`added ${request.body.name} the ${request.body.species}`);
});

app.get('/pets', (request, res) => {
  res.send(['tobi', 'loki', 'jane']);
});

app.get('/json-seq', (request, res) => {
  res
    .set('content-type', 'application/json-seq')
    .send('\u001E{"id":1}\n\u001E{"id":2}\n');
});

app.get('/invalid-json', (request, res) => {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(
    ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
  );
});

app.get('/invalid-json-forbidden', (request, res) => {
  res.set('content-type', 'application/json');
  res.status(403).send('Forbidden');
});

app.get('/text', (request, res) => {
  res.send('just some text');
});

app.get('/basic-auth', basicAuth('tobi', 'learnboost'), (request, res) => {
  res.end('you win!');
});

app.get('/basic-auth/again', basicAuth('tobi', ''), (request, res) => {
  res.end('you win again!');
});

app.post('/auth', basicAuth('foo', 'bar'), (request, res) => {
  const auth = request.headers.authorization;
  const parts = auth.split(' ');
  const credentials = Buffer.from(parts[1], 'base64').toString().split(':');
  const user = credentials[0];
  const pass = credentials[1];

  res.send({ user, pass });
});

app.get('/error', (request, res) => {
  res.status(500).send('boom');
});

app.get('/unauthorized', (request, res) => {
  res.sendStatus(401);
});

app.get('/bad-request', (request, res) => {
  res.sendStatus(400);
});

app.get('/not-acceptable', (request, res) => {
  res.sendStatus(406);
});

app.get('/no-content', (request, res) => {
  res.sendStatus(204);
});

app.delete('/no-content', (request, res) => {
  res.set('content-type', 'application/json');
  res.sendStatus(204);
});

app.post('/created', (request, res) => {
  res.status(201).send('created');
});

app.post('/unprocessable-entity', (request, res) => {
  res.status(422).send('unprocessable entity');
});

app.get('/arraybuffer', (request, res) => {
  const content = new ArrayBuffer(1000);
  res.set('Content-Type', 'application/vnd.superagent');
  res.send(content);
});

app.get('/arraybuffer-unauthorized', (request, res) => {
  res.set('Content-Type', 'application/json');
  res
    .status(401)
    .send('{"message":"Authorization has been denied for this request."}');
});

app.post('/empty-body', bodyParser.text(), (request, res) => {
  if (
    typeof request.body === 'object' &&
    Object.keys(request.body).length === 0
  ) {
    res.sendStatus(204);
  } else {
    res.sendStatus(400);
  }
});

app.get('/collection-json', (request, res) => {
  res.set('content-type', 'application/vnd.collection+json');
  res.send({ name: 'chewbacca' });
});

app.get('/invalid-json', (request, res) => {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(
    ")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}"
  );
});

app.options('/options/echo/body', bodyParser.json(), (request, res) => {
  res.send(request.body);
});

app.get('/cookie-redirect', (request, res) => {
  res.set('Set-Cookie', 'replaced=yes');
  res.append('Set-Cookie', 'from-redir=1', true);
  res.redirect(303, '/show-cookies');
});

app.get('/set-cookie', (request, res) => {
  res.cookie('persist', '123');
  res.send('ok');
});

app.get('/show-cookies', (request, res) => {
  res.set('content-type', 'text/plain');
  res.send(request.headers.cookie);
});

app.put('/redirect-303', (request, res) => {
  res.redirect(303, '/reply-method');
});

app.put('/redirect-307', (request, res) => {
  res.redirect(307, '/reply-method');
});

app.put('/redirect-308', (request, res) => {
  res.redirect(308, '/reply-method');
});

app.all('/reply-method', (request, res) => {
  res.send(`method=${request.method.toLowerCase()}`);
});

app.get('/tobi', (request, res) => {
  res.send('tobi');
});

app.get('/relative', (request, res) => {
  res.redirect('tobi');
});

app.get('/relative/sub', (request, res) => {
  res.redirect('../tobi');
});

app.get('/header', (request, res) => {
  res.redirect('/header/2');
});

app.post('/header', (request, res) => {
  res.redirect('/header/2');
});

app.get('/header/2', (request, res) => {
  res.send(request.headers);
});

app.get('/bad-redirect', (request, res) => {
  res.status(307).end();
});

app.all('/ua', (request, res) => {
  const { headers } = request;
  if (process.env.HTTP2_TEST) {
    for (const name of Object.keys(headers)) {
      if (isPseudoHeader(name)) {
        delete headers[name];
      }
    }
  }

  res.writeHead(200, headers);
  request.pipe(res);
});

app.get('/manny', (request, res) => {
  res.status(200).json({ name: 'manny' });
});

function serveImageWithType(res, type) {
  const img = fs.readFileSync(`${__dirname}/../node/fixtures/test.png`);
  res.writeHead(200, { 'Content-Type': type });
  res.end(img, 'binary');
}

app.get('/image', (request, res) => {
  serveImageWithType(res, 'image/png');
});
app.get('/image-as-octets', (request, res) => {
  serveImageWithType(res, 'application/octet-stream');
});

app.get('/chunked-json', (request, res) => {
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

app.get('/if-mod', (request, res) => {
  if (request.header('if-modified-since')) {
    res.status(304).end();
  } else {
    res.send(`${Date.now()}`);
  }
});

const called = {};
app.get('/error/ok/:id', (request, res) => {
  if (request.query.qs != 'present') {
    return res.status(400).end('query string lost');
  }

  const { id } = request.params;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.send(request.headers);
    delete called[id];
  }
});

app.get('/delay/:ms/ok/:id', (request, res) => {
  const { id } = request.params;
  if (!called[id]) {
    called[id] = true;
    const ms = Math.trunc(request.params.ms);
    setTimeout(() => {
      res.sendStatus(200);
    }, ms);
  } else {
    res.send(`ok = ${request.url}`);
    delete called[id];
  }
});

app.get('/error/redirect/:id', (request, res) => {
  const { id } = request.params;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.redirect('/movies');
    delete called[id];
  }
});

app.get('/error/redirect-error:id', (request, res) => {
  const { id } = request.params;
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
