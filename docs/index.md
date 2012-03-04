
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
  
    request('GET, '/search/).end(callback);

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

 The `.send()` method accepts objects, which when used with the __GET__ method will form a query-string. The following will produce the path `/search?query=Manny&range=1..5&order=desc`.
 
     request
       .get('/search')
       .send({ query: 'Manny' })
       .send({ range: '1..5' })
       .send({ order: 'desc' })
       .end(function(res){

       });

  Or as a single object:
  
    request
      .get('/search')
      .send({ query: 'Manny', range: '1..5', order: 'desc' })
      .end(function(res){

      });

  The `.send()` method accepts strings as well:
  
      request
        .get('/querystring')
        .send('search=Manny&range=1..5')
        .end(function(res){

        });

### POST / PUT requests

  A typical JSON __POST__ request might look a little like the following, where we set the Content-Type header field appropriately, and "write" some data, in this case just a JSON string.

      request.post('/user')
        .set('Content-Type', 'application/json')
        .send('{"name":"tj","pet":"tobi"})
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

  SuperAgent formats are extensible, however by default "json" and "form-data" are supported. To send the data as `application/x-www-form-urlencoded` simply invoke `.type()` with "form-data", where the default is "json". This request will POST the body "name=tj&pet=tobi".

      request.post('/user')
        .type('form-data')
        .send({ name: 'tj' })
        .send({ pet: 'tobi' })
        .end(callback)

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

## Basic authentication

  Basic auth is currently provided by the _node_ client in two forms, first via the URL as "user:pass":
    
    request.get('http://tobi:learnboost@local').end(callback);

  As well as via the `.auth()` method:

    request
      .get('http://local')
      .auth('tobo', 'learnboost')
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

### Response text

  The `res.text` property is also available for a string representation of the body as illustrated by this test:
  
    var req = request.post('local/echo');
    req.write('{"name"').should.be.a('boolean');
    req.write(':"tobi"}').should.be.a('boolean');
    req.end(function(res){
      res.text.should.equal('{"name":"tobi"}');
    });

## Response properties

  Many helpful flags and properties are set on the `Response` object, ranging from the response text, parsed response body, header fields, status flags and more.
  
### Response text

  The `res.text` property contains the unparsed response body string.

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

## Compression

  The Node client supports compressed responses, best of all, you don't have to do anything! It just works.
