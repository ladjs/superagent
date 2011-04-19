
# SuperAgent

  Progressive high-level request HTTP client for node.

  Mikeal's library is great, but when you want something in between node's low level API, and a high level API, things start to fall apart. The aim of this library is to provide a similar high-level interface, as well as a progressive one.

  __WARNING__: work in progress

## Installation

    $ npm install superagent

## TODO

  - progressive multipart support (req / res)
  - schema relative redirects
  - SSL

## Examples

### GET

 Below is a simple __GET__ request, with buffered body available at `res.body` and `body`. By default when passing a callback there is no need to listen on "end", as the callback is invoked when the response is complete.
 
     var agent = require('superagent');
    
     agent.get('http://google.com', function(err, res, body){
       console.log(res.statusCode);
       console.log(body);
     });

### GET Query String

 The second object passed becomes the querystring:
 
     agent.get('http://google.com', { search: 'foobar' }, function(err, res, body){
       // whatever
     });

### Redirects

 The default maximum redirects defaults to `5`, however we can alter this with `.redirects(n)` or `.maxRedirects(n)`. 

     var req = agent.get('http://google.com', function(err, res, body){
       console.log(res.statusCode);
       console.log(body);
     });

     req.on('redirect', function(location){
       console.log('redirecting to %s', location);
     });

### Buffered Responses

 By default data is not buffered, and you must listen on response "data" events like you normally would. SuperAgent provides the `.buffer()` and `.parse()` methods, which are equivalent, and check `Content-Type` header and associate a parser with the response.

 For example the following will automatically parse/buffer `text/*`, `application/json`, and `application/x-www-form-urlencoded` responses:
 
      agent
      .get('http://localhost:3000')
      .parse()
      .on('response', function(res){
        res.on('end', function(){
          console.log(res.body);
        });
      }).end();

 Sometimes it is not ideal to simply halt processing until the data is buffered / parsed, which is why SuperAgent gives you the choice of this API, or the callback API.

### POSTing JSON

 Posting some JSON is easy, the `.json()` method writes a jsonified version of the object passed, providing a content-length and content-type.

    agent
      .post('http://localhost:3000')
      .json({ foo: 'bar' });

### POSTing Form Data

  The same can be done for `application/x-www-form-urlencoded` data, using the `.form()` method.
  
      agent
        .post('http://localhost:3000')
        .form({ foo: 'bar' });

## Running Tests

    $ make test

## License 

(The MIT License)

Copyright (c) 2011 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.