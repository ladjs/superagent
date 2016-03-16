var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var basicAuth = require('basic-auth-connect');

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

app.use(bodyParser.urlencoded({ extended: true }));
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

app.get('/', function(req, res){
  res.redirect('/movies');
});

app.get('/movies', function(req, res){
  res.redirect('/movies/all');
});

app.get('/movies/all', function(req, res){
  res.redirect('/movies/all/0');
});

app.get('/movies/all/0', function(req, res){
  res.status(200).send('first movie page');
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

app.listen(process.env.ZUUL_PORT);
