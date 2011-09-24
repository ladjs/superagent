
0.1.2 / 2011-09-24 
==================

  * Added markdown documentation
  * Added `request(url[, fn])` support to the client
  * Added `qs` dependency to package.json
  * Added options for `Request#pipe()`
  * Added support for `request(url, callback)`
  * Added `request(url)` as shortcut for `request.get(url)`
  * Added `Request#pipe(stream)`
  * Added inherit from `Stream`
  * Added multipart support
  * Added ssl support (node)
  * Removed Content-Length field from client
  * Fixed buffering, `setEncoding()` to utf8 [reported by stagas]
  * Fixed "end" event when piping

0.1.1 / 2011-08-20 
==================

  * Added `res.redirect` flag (node)
  * Added redirect support (node)
  * Added `Request#redirects(n)` (node)
  * Added `.set(object)` header field support
  * Fixed `Content-Length` support

0.1.0 / 2011-08-09 
==================

  * Added support for multiple calls to `.data()`
  * Added support for `.get(uri, obj)`
  * Added GET `.data()` querystring support
  * Added IE{6,7,8} support [alexyoung]

0.0.1 / 2011-08-05 
==================

  * Initial commit

