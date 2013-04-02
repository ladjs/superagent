
# SuperAgent

 Super Agent is light-weight progressive ajax API crafted for flexibility, readability, and a low learning curve after being frustrated with many of the existing request APIs. It also works with Node.js!

     request
       .post('/api/pet')
       .send({ name: 'Manny', species: 'cat' })
       .set('X-API-Key', 'foobar')
       .set('Accept', 'application/json')
       .end(function(res){
         if (res.ok) {
           alert('yay got ' + JSON.stringify(res.body));
         } else {
           alert('Oh no! error ' + res.text);
         }
       });

## Test documentation

  The following [test documentation](docs/test.html) was generated with [Mocha's](http://visionmedia.github.com/mocha) "doc" reporter, and directly reflects the test suite. This provides an additional source of documentation.

## Request basics

 A request can be initiated by invoking the appropriate method on the `request` object, then calling `.end()` to send the request. For example a simple GET request:

     request
       .get('/search')
       .end(function(res){

       });

  A method string may also be passed:

    request('GET', '/search').end(callback);

 The __node__ client may also provide absolute urls:

     request
       .get('http://example.com/search')
       .end(function(res){

       });

  __DELETE__, __HEAD__, __POST__, __PUT__ and other __HTTP__ verbs may also be used, simply change the method name:

    request
      .head('/favicon.ico')
      .end(function(res){

      });

  __DELETE__ is a special-case, as it's a reserved word, so the method is named `.del()`:

    request
      .del('/user/1')
      .end(function(res){

      });

  The HTTP method defaults to __GET__, so if you wish, the following is valid:

     request('/search', function(res){

     });

## Setting header fields

  Setting header fields is simple, invoke `.set()` with a field name and value:

     request
       .get('/search')
       .set('API-Key', 'foobar')
       .set('Accept', 'application/json')
       .end(callback);

  You may also pass an object to set several fields in a single call:

     request
       .get('/search')
       .set({ 'API-Key': 'foobar', Accept: 'application/json' })
       .end(callback);

## GET requests

 The `.query()` method accepts objects, which when used with the __GET__ method will form a query-string. The following will produce the path `/search?query=Manny&range=1..5&order=desc`.

     request
       .get('/search')
       .query({ query: 'Manny' })
       .query({ range: '1..5' })
       .query({ order: 'desc' })
       .end(function(res){

       });

  Or as a single object:

    request
      .get('/search')
      .query({ query: 'Manny', range: '1..5', order: 'desc' })
      .end(function(res){

      });

  The `.query()` method accepts strings as well:

      request
        .get('/querystring')
        .query('search=Manny&range=1..5')
        .end(function(res){

        });

  Or joined:

      request
        .get('/querystring')
        .query('search=Manny')
        .query('range=1..5')
        .end(function(res){

        });


### POST / PUT requests

  A typical JSON __POST__ request might look a little like the following, where we set the Content-Type header field appropriately, and "write" some data, in this case just a JSON string.

      request.post('/user')
        .set('Content-Type', 'application/json')
        .send('{"name":"tj","pet":"tobi"}')
        .end(callback)

  Since JSON is undoubtably the most common, it's the _default_! The following example is equivalent to the previous.

      request.post('/user')
        .send({ name: 'tj', pet: 'tobi' })
        .end(callback)

  Or using multiple `.send()` calls:

      request.post('/user')
        .send({ name: 'tj' })
        .send({ pet: 'tobi' })
        .end(callback)

  By default sending strings will set the Content-Type to `application/x-www-form-urlencoded`,
  multiple calls will be concatenated with `&`, here resulting in `name=tj&pet=tobi`:

      request.post('/user')
        .send('name=tj')
        .send('pet=tobi')
        .end(callback);

  SuperAgent formats are extensible, however by default "json" and "form" are supported. To send the data as `application/x-www-form-urlencoded` simply invoke `.type()` with "form", where the default is "json". This request will POST the body "name=tj&pet=tobi".

      request.post('/user')
        .type('form')
        .send({ name: 'tj' })
        .send({ pet: 'tobi' })
        .end(callback)

 Note: "form" is aliased as "form-data" and "urlencoded" for backwards compat.

## Setting the Content-Type

  The obvious solution is to use the `.set()` method:

     request.post('/user')
       .set('Content-Type', 'application/json')

  As a short-hand the `.type()` method is also available, accepting
  the canonicalized MIME type name complete with type/subtype, or
  simply the extension name such as "xml", "json", "png", etc:

     request.post('/user')
       .type('application/json')

     request.post('/user')
       .type('json')

     request.post('/user')
       .type('png')

## Query strings

  When issuing a __GET__ request the `res.send(obj)` method will invoke `res.query(obj)`, this is a method which may be used with other HTTP methods in order to build up a query-string. For example populating `?format=json&dest=/login` on a __POST__:

    request
      .post('/')
      .query({ format: 'json' })
      .query({ dest: '/login' })
      .send({ post: 'data', here: 'wahoo' })
      .end(callback);

## Parsing response bodies

  Super Agent will parse known response-body data for you, currently supporting _application/x-www-form-urlencoded_, _application/json_, and _multipart/form-data_.

### JSON / Urlencoded

  The property `res.body` is the parsed object, for example if a request responded with the JSON string '{"user":{"name":"tobi"}}', `res.body.user.name` would be "tobi". Likewise the x-www-form-urlencoded value of "user[name]=tobi" would yield the same result.

### Multipart

  The Node client supports _multipart/form-data_ via the [Formidable](https://github.com/felixge/node-formidable) module. When parsing multipart responses, the object `res.files` is also available to you. Suppose for example a request responds with the following multipart body:

    --whoop
    Content-Disposition: attachment; name="image"; filename="tobi.png"
    Content-Type: image/png

    ... data here ...
    --whoop
    Content-Disposition: form-data; name="name"
    Content-Type: text/plain

    Tobi
    --whoop--

  You would have the values `res.body.name` provided as "Tobi", and `res.files.image` as a `File` object containing the path on disk, filename, and other properties.

## Response properties

  Many helpful flags and properties are set on the `Response` object, ranging from the response text, parsed response body, header fields, status flags and more.

### Response text

  The `res.text` property contains the unparsed response body string. This
  property is always present for the client API, and only when the mime type
  matches "text/*", "*/json", or "x-www-form-urlencoding" by default for node. The
  reasoning is to conserve memory, as buffering text of large bodies such as multipart files or images is extremely inefficient.

  To force buffering see the "Buffering responses" section.

### Response body

  Much like SuperAgent can auto-serialize request data, it can also automatically parse it. When a parser is defined for the Content-Type, it is parsed, which by default includes "application/json" and "application/x-www-form-urlencoded". The parsed object is then available via `res.body`.

### Response header fields

  The `res.header` contains an object of parsed header fields, lowercasing field names much like node does. For example `res.header['content-length']`.

### Response Content-Type

  The Content-Type response header is special-cased, providing `res.type`, which is void of the charset (if any). For example the Content-Type of "text/html; charset=utf8" will provide "text/html" as `res.type`, and the `res.charset` property would then contain "utf8".

### Response status

  The response status flags help determine if the request was a success, among other useful information, making SuperAgent ideal for interacting with RESTful web services. These flags are currently defined as:

     var type = status / 100 | 0;

     // status / class
     res.status = status;
     res.statusType = type;

     // basics
     res.info = 1 == type;
     res.ok = 2 == type;
     res.clientError = 4 == type;
     res.serverError = 5 == type;
     res.error = 4 == type || 5 == type;

     // sugar
     res.accepted = 202 == status;
     res.noContent = 204 == status || 1223 == status;
     res.badRequest = 400 == status;
     res.unauthorized = 401 == status;
     res.notAcceptable = 406 == status;
     res.notFound = 404 == status;
     res.forbidden = 403 == status;

## Aborting requests

  To abort requests simply invoke the `req.abort()` method.

## Request timeouts

  A timeout can be applied by invoking `req.timeout(ms)`, after which an error
  will be triggered. To differentiate between other errors the `err.timeout` property
  is set to the `ms` value. __NOTE__ that this is a timeout applied to the request
  and all subsequent redirects, not per request.

## Basic authentication

  Basic auth is currently provided by the _node_ client in two forms, first via the URL as "user:pass":

    request.get('http://tobi:learnboost@local').end(callback);

  As well as via the `.auth()` method:

    request
      .get('http://local')
      .auth('tobo', 'learnboost')
      .end(callback);

## Following redirects

  By default up to 5 redirects will be followed, however you may specify this with the `res.redirects(n)` method:

    request
      .get('/some.png')
      .redirects(2)
      .end(callback);

## Piping data

  The Node client allows you to pipe data to and from the request. For example piping a file's contents as the request:

    var request = require('superagent')
      , fs = require('fs');

    var stream = fs.createReadStream('path/to/my.json');
    var req = request.post('/somewhere');
    req.type('json');
    stream.pipe(req);

  Or piping the response to a file:

    var request = require('superagent')
      , fs = require('fs');

    var stream = fs.createWriteStream('path/to/my.json');
    var req = request.get('/some.json');
    req.pipe(stream);

## Multipart requests

  Super Agent is also great for _building_ multipart requests, providing a both low-level and high-level APIs.

  The low-level API uses `Part`s to represent a file or field. The `.part()` method returns a new `Part`, which provides an API similar to the request itself.

     var req = request.post('/upload');

     req.part()
       .set('Content-Type', 'image/png')
       .set('Content-Disposition', 'attachment; filename="myimage.png"')
       .write('some image data')
       .write('some more image data');

     req.part()
       .set('Content-Disposition', 'form-data; name="name"')
       .set('Content-Type', 'text/plain')
       .write('tobi');

     req.end(callback);

### Attaching files

  As mentioned a higher-level API is also provided, in the form of `.attach(name, [path], [filename])` and `.field(name, value)`. Attaching several files is simple, you can also provide a custom filename for the attachment, otherwise the basename of the attached file is used.

    request
      .post('/upload')
      .attach('avatar', 'path/to/tobi.png', 'user.png')
      .attach('image', 'path/to/loki.png')
      .attach('file', 'path/to/jane.png')
      .end(callback);

### Field values

  Much like form fields in HTML, you can set field values with the `.field(name, value)` method. Suppose you want to upload a few images with your name and email, your request might look something like this:

     request
       .post('/upload')
       .field('user[name]', 'Tobi')
       .field('user[email]', 'tobi@learnboost.com')
       .attach('image', 'path/to/tobi.png')
       .end(callback);

## Compression

  The node client supports compressed responses, best of all, you don't have to do anything! It just works.

## Buffering responses

  To force buffering of response bodies as `res.text` you may invoke `req.buffer()`. To undo the default of buffering for text responses such
  as "text/plain", "text/html" etc you may invoke `req.buffer(false)`.

  When buffered the `res.buffered` flag is provided, you may use this to
  handle both buffered and unbuffered responses in the same callback.

## CORS

  The `.withCredentials()` method enables the ability to send cookies
  from the origin, however only when "Access-Control-Allow-Origin" is
  _not_ a wildcard ("*"), and "Access-Control-Allow-Credentials" is "true".

    request
      .get('http://localhost:4001/')
      .withCredentials()
      .end(function(res){
        assert(200 == res.status);
        assert('tobi' == res.text);
        next();
      })

## Error handling

  When an error occurs super agent will first check the arity of the callback
  function given, if two parameters are present the error is passed, as shown
  below:

    request
     .post('/upload')
     .attach('image', 'path/to/tobi.png')
     .end(function(err, res){

     });

  When a callback is omitted, or only a `res` parameter is present,
  an "error" event is emitted:

    request
      .post('/upload')
      .attach('image', 'path/to/tobi.png')
      .on('error', handle)
      .end(function(res){

      });

  Note that a 4xx or 5xx response with super agent is _not_ considered an error
  by default. For example if you get a 500 or 403 response, this status information
  will be available via `res.error`, `res.status` and the others mentioned in "Response properties", however no `Error` object is passed for these responses. An error includes network failures, parsing errors, etcetera.

  When an HTTP error occurs (4xx or 5xx response) the `res.error` property is an `Error` object,
  this allows you to perform checks such as:

    if (res.error) {
      alert('oh no ' + res.error.message);
    } else {
      alert('got ' + res.status + ' response');
    }

