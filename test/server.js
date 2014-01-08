
/**
 * Module dependencies.
 */

var express = require('express');

var app = express();

app.set('json spaces', 0);

app.use(function(req, res, next){
  if ('/echo' != req.url) return next();
  res.set(req.headers);
  req.pipe(res);
});

app.use(express.bodyParser());
app.use(express.cookieParser());

app.use(function(req, res, next){
  res.cookie('name', 'tobi');
  next();
});

app.use('/xdomain', function(req, res, next){
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', req.get('Origin'));
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

app.get('/', function(req, res){
  res.redirect('/test/');
});

app.get('/error', function(req, res){
  res.status(500).send('fail');
});

app.get('/unauthorized', function(req, res){
  res.send(401);
});

app.get('/bad-request', function(req, res){
  res.send(400);
});

app.get('/not-acceptable', function(req, res){
  res.send(406);
});

app.get('/no-content', function(req, res){
  res.send(204);
});

app.get('/delay/:ms', function(req, res){
  var ms = ~~req.params.ms;
  setTimeout(function(){
    res.send(200);
  }, ms);
});

app.put('/user/:id', function(req, res){
  res.send('updated');
});

app.patch('/user/:id', function(req, res){
  res.send('updated');
});

app.get('/querystring', function(req, res){
  res.send(req.query);
});

app.post('/todo/item', function(req, res){
  var buf = '';
  req.on('data', function(chunk){ buf += chunk; });
  req.on('end', function(){
    res.send('added "' + buf + '"');
  });
});

app.post('/user/:id/pet', function(req, res){
  res.send('added pet "' + req.body.pet + '"');
});

app.post('/user', function(req, res){
  res.send('created');
});

app.del('/user/:id', function(req, res){
  res.send('deleted');
});

app.all('/echo-header/:field', function(req, res){
  res.send(req.headers[req.params.field]);
});

app.post('/pet', function(req, res){
  res.send('added ' + req.body.name + ' the ' + req.body.species);
});

app.get('/pets', function(req, res){
  res.send(['tobi', 'loki', 'jane']);
});

app.get('/text', function(req, res){
  res.send("just some text");
});

app.get('/foo', function(req, res){
  res
    .header('Content-Type', 'application/x-www-form-urlencoded')
    .send('foo=bar');
});

app.post('/auth', function(req, res) {
  var auth = req.headers.authorization,
      parts = auth.split(' '),
      credentials = new Buffer(parts[1], 'base64').toString().split(':'),
      user = credentials[0],
      pass = credentials[1];

  res.send({ user : user, pass : pass });
});

app.get('/xdomain', function(req, res){
  res.send(req.cookies.name);
});

app.use(express.static(__dirname + '/../'));

var server = app.listen(process.env.ZUUL_PORT, function() {
  //console.log('Test server listening on port %d', server.address().port);
});
