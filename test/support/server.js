var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var basicAuth = require('basic-auth-connect');
var fs = require('fs');

var app = express();

app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store');
  next();
});

app.all('/url', function(req, res){
  res.send(req.url);
});

app.all('/echo', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

var uniq = 0;
app.all('/unique', function(req, res){
  res.send('never the same ' + (uniq++));
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().none());

app.all('/formecho', function(req, res){
  if (!/application\/x-www-form-urlencoded|multipart\/form-data/.test(req.headers['content-type'])) {
    return res.status(400).end("wrong type");
  }
  res.json(req.body);
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/xdomain', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', req.get('Origin'));
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/xdomain', function(req, res){
  res.send('tobi');
});

app.get('/login', function(req, res){
  res.status(200).send('<form id="login"></form>');
});

app.get('/json', function(req, res){
  res.status(200).json({ name: 'manny' });
});

app.get('/json-hal', function(req, res){
  res.set('content-type', 'application/hal+json');
  res.send({ name: 'hal 5000' });
});

app.get('/ok', function(req, res){
  res.send('ok');
});

app.get('/foo', function(req, res){
  res
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .send('foo=bar');
});

app.get('/form-data', function(req, res){
  res.header('Content-Type', 'application/x-www-form-urlencoded');
  res.send('pet[name]=manny');
});

app.post('/movie', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.set('QUERY', JSON.stringify(req.query));
  res.status(200).send('first movie page');
});

app.get('/movies/random', function(req, res){
  res.redirect('/movie/4');
});

app.get('/movie/4', function(req, res){
  setTimeout(function(){
    res.send('not-so-random movie');
  }, 1000);
});

app.get('/links', function(req, res){
  res.header('Link', '<https://api.github.com/repos/visionmedia/mocha/issues?page=2>; rel="next"');
  res.end();
});

app.get('/xml', function(req, res){
  res.type('xml');
  res.status(200).send('<some><xml></xml></some>');
});

app.get('/custom', function(req, res){
  res.type('application/x-custom');
  res.status(200).send('custom stuff');
});

app.put('/user/:id', function(req, res){
  res.send('updated');
});

app.put('/user/:id/body', function(req, res){
  res.send("received " + req.body.user);
});

app.patch('/user/:id', function(req, res){
  res.send('updated');
});

app.post('/user/:id/pet', function(req, res){
  res.send('added pet "' + req.body.pet + '"');
});

app.post('/user', function(req, res){
  res.send('created');
});

app.delete('/user/:id', function(req, res){
  res.send('deleted');
});

app.post('/todo/item', function(req, res){
  var buf = '';
  req.on('data', function(chunk){ buf += chunk; });
  req.on('end', function(){
    res.send('added "' + buf + '"');
  });
});

app.get('/delay/const', function (req, res) {
  res.redirect('/delay/3000');
});

app.get('/delay/zip', function (req, res) {
  res.writeHead(200, {"Content-Type":"text/plain", "Content-Encoding":"gzip"});
  setTimeout(function(){
    res.end();
  }, 10000);
});

app.get('/delay/json', function (req, res) {
  res.writeHead(200, {"Content-Type":"application/json"});
  setTimeout(function(){
    res.end();
  }, 10000);
});

var slowBodyCallback;
app.get('/delay/slowbody', function(req, res){
  res.writeHead(200, {"Content-Type":"application/octet-stream"});

  // Send lots of garbage data to overflow all buffers along the way,
  // so that the browser gets some data before the request is done
  var initialDataSent = new Promise(function(resolve){
    res.write(new Buffer(4000), function(){
      res.write(new Buffer(16000));
      resolve();
    });
  });

  // Make sure sending of request body takes over 1s,
  // so that the test can't pass by accident.
  var minimumTime = new Promise(function(resolve){setTimeout(resolve, 1001)});

  new Promise(function(resolve){
    // Waiting full 10 seconds for the test would be too annoying,
    // so the remote callback is a hack to push the test forward
    slowBodyCallback = resolve;
    setTimeout(resolve, 10000);
  })
  .then(function(){
    return Promise.all([initialDataSent, minimumTime]);
  })
  .then(function(){
    res.end('bye');
  });
});

app.get('/delay/slowbody/finish', function(req, res){
  if (slowBodyCallback) slowBodyCallback();
  res.sendStatus(204);
});

app.get('/delay/:ms', function(req, res){
  var ms = ~~req.params.ms;
  setTimeout(function(){
    res.sendStatus(200);
  }, ms);
});

app.get('/querystring', function(req, res){
  res.send(req.query);
});

app.get('/echo-header/:field', function(req, res){
  res.send(req.headers[req.params.field]);
});

app.post('/pet', function(req, res){
  res.send('added ' + req.body.name + ' the ' + req.body.species);
});

app.get('/pets', function(req, res){
  res.send(['tobi', 'loki', 'jane']);
});

app.get('/invalid-json', function(req, res) {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
});

app.get('/invalid-json-forbidden', function(req, res) {
  res.set('content-type', 'application/json');
  res.status(403).send("Forbidden");
});

app.get('/text', function(req, res){
  res.send("just some text");
});

app.get('/basic-auth', basicAuth('tobi', 'learnboost'), function(req, res){
  res.end('you win!');
});

app.get('/basic-auth/again', basicAuth('tobi', ''), function(req, res){
  res.end('you win again!');
});

app.post('/auth', basicAuth('foo', 'bar'), function(req, res) {
  var auth = req.headers.authorization,
      parts = auth.split(' '),
      credentials = new Buffer(parts[1], 'base64').toString().split(':'),
      user = credentials[0],
      pass = credentials[1];

  res.send({ user : user, pass : pass });
});

app.get('/error', function(req, res){
  res.status(500).send('boom');
});

app.get('/unauthorized', function(req, res){
  res.sendStatus(401);
});

app.get('/bad-request', function(req, res){
  res.sendStatus(400);
});

app.get('/not-acceptable', function(req, res){
  res.sendStatus(406);
});

app.get('/no-content', function(req, res){
  res.sendStatus(204);
});

app.delete('/no-content', function(req, res){
  res.set('content-type', 'application/json');
  res.sendStatus(204);
});

app.get('/arraybuffer', function(req, res) {
  var content = new ArrayBuffer(1000);
  res.set('Content-Type', 'application/vnd.superagent');
  res.send(content);
});

app.get('/arraybuffer-unauthorized', function(req, res) {
  res.set('Content-Type', 'application/json');
  res.status(401).send('{"message":"Authorization has been denied for this request."}');
});

app.post('/empty-body', bodyParser.text(), function(req, res) {
  if (typeof req.body === 'object' && Object.keys(req.body).length === 0) {
    res.sendStatus(204);
  }
  else {
    res.sendStatus(400);
  }
});


app.get('/collection-json', function(req, res){
  res.set('content-type', 'application/vnd.collection+json');
  res.send({ name: 'chewbacca' });
});

app.get('/invalid-json', function(req, res) {
  res.set('content-type', 'application/json');
  // sample invalid json taken from https://github.com/swagger-api/swagger-ui/issues/1354
  res.send(")]}', {'header':{'code':200,'text':'OK','version':'1.0'},'data':'some data'}");
});

app.options('/options/echo/body', bodyParser.json(), function (req, res) {
  res.send(req.body);
});

app.put('/redirect-303', function(req, res){
  res.redirect(303, '/reply-method');
});

app.put('/redirect-307', function(req, res){
  res.redirect(307, '/reply-method');
});

app.put('/redirect-308', function(req, res){
  res.redirect(308, '/reply-method');
});

app.all('/reply-method', function(req, res){
  res.send('method=' + req.method.toLowerCase());
});

app.get('/tobi', function(req, res){
  res.send('tobi');
});

app.get('/relative', function(req, res){
  res.redirect('tobi');
});

app.get('/relative/sub', function(req, res){
  res.redirect('../tobi');
});

app.get('/header', function(req, res){
  res.redirect('/header/2');
});

app.post('/header', function(req, res){
  res.redirect('/header/2');
});

app.get('/header/2', function(req, res){
  res.send(req.headers);
});

app.get('/bad-redirect', function(req, res){
  res.status(307).end();
});

app.all('/ua', function(req, res){
  res.writeHead(200, req.headers);
  req.pipe(res);
});

app.get('/manny', function(req, res){
  res.status(200).json({name:"manny"});
});

function serveImageWithType(res, type) {
  var img = fs.readFileSync(__dirname + '/../node/fixtures/test.png');
  res.writeHead(200, {'Content-Type': type });
  res.end(img, 'binary');
}
app.get('/image', function(req, res){
  serveImageWithType(res, 'image/png');
});
app.get('/image-as-octets', function(req, res){
  serveImageWithType(res, 'application/octet-stream');
});

app.get('/chunked-json', function(req, res){
  res.set('content-type', 'application/json');
  res.set('Transfer-Encoding', 'chunked');

  var chunk = 0;
  var interval = setInterval(function(){
    chunk++;
    if(chunk === 1) res.write('{ "name_' + chunk + '": "');
    if(chunk > 1) res.write('value_' + chunk + '", "name_' + chunk + '": "');
    if(chunk === 10) {
      clearInterval(interval);
      res.write('value_' + chunk + '"}');
      res.end();
    }
  },10);
});

app.get('/if-mod', function(req, res){
  if (req.header('if-modified-since')) {
    res.status(304).end();
  } else {
    res.send('' + Date.now());
  }
});

var called = {};
app.get('/error/ok/:id', function(req, res) {
  if (req.query.qs != 'present') {
    return res.status(400).end("query string lost");
  }

  var id = req.params.id;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.send(req.headers);
    delete called[id];
  }
});

app.get('/delay/:ms/ok/:id', function(req, res){
  var id = req.params.id;
  if (!called[id]) {
    called[id] = true;
    var ms = ~~req.params.ms;
    setTimeout(function(){
      res.sendStatus(200);
    }, ms);
  } else {
    res.send('ok');
    delete called[id];
  }
});

app.get('/error/redirect/:id', function(req, res) {
  var id = req.params.id;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.redirect('/movies');
    delete called[id];
  }
});

app.get('/error/redirect-error:id', function(req, res) {
  var id = req.params.id;
  if (!called[id]) {
    called[id] = true;
    res.status(500).send('boom');
  } else {
    res.redirect('/error');
    delete called[id];
  }
});

app.listen(process.env.ZUUL_PORT);
