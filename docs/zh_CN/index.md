# SuperAgent

SuperAgent是轻量级的渐进式ajax API，具有灵活性、可读性和较低的学习曲线。 它也适用于Node.js!  

     request
       .post('/api/pet')
       .send({ name: 'Manny', species: 'cat' })
       .set('X-API-Key', 'foobar')
       .set('Accept', 'application/json')
       .then(res => {
          alert('yay got ' + JSON.stringify(res.body));
       });

## 测试文档 

[**English**](/)

下面的[测试文档](../test.html)是用[Mocha](https://mochajs.org/)的"文档"报告器生成的，并直接反映了测试套件。 这提供了额外的文档来源。  

## 基本请求

可以通过调用 `request` 对象上的适当方法来发起请求，然后调用 `.then()` ( 或 `.end()` 或 [`await`](#promise-and-generator-support) )发送请求。例如一个简单的 __GET__ 请求：

     request
       .get('/search')
       .then(res => {
          // res.body, res.headers, res.status
       })
       .catch(err => {
          // err.message, err.response
       });

HTTP 方法也可以作为字符串传递：  
译者注：大小写皆可。

    request('GET', '/search').then(success, failure);

旧式回调也受支持，但不推荐使用。您可以调用 `.end()` *代替* `.then()`：

    request('GET', '/search').end(function(err, res){
      if (res.ok) {}
    });

可以使用绝对 URL。在 Web 浏览器中，绝对 URL 仅在服务器实现 [CORS](#cors) 时才有效。

     request
       .get('https://example.com/search')
       .then(res => {

       });

__Node__ 客户端支持向 [Unix 域套接字](https://zh.wikipedia.org/wiki/Unix%E5%9F%9F%E5%A5%97%E6%8E%A5%E5%AD%97) 发出请求：

    // pattern: https?+unix://SOCKET_PATH/REQUEST_PATH
    //在套接字路径中将 `%2F` 用作 `/`
    try {
      const res = await request
        .get('http+unix://%2Fabsolute%2Fpath%2Fto%2Funix.sock/search');
      // res.body, res.headers, res.status
    } catch(err) {
      // err.message, err.response
    }

__DELETE__、__HEAD__、__PATCH__、__POST__ 和 __PUT__ 请求也可以使用，只需更改方法名称：

    request
      .head('/favicon.ico')
      .then(res => {

      });

__DELETE__ 也可以用 `.del()` 调用以与旧版 IE 兼容，其中 `delete` 是保留字。

HTTP 方法默认为 __GET__，因此如果您愿意，以下代码是有效的：

     request('/search', (err, res) => {

     });

## 设置请求头字段

设置请求头字段很简单，调用 `.set()` 时传入字段名称和值：

     request
       .get('/search')
       .set('API-Key', 'foobar')
       .set('Accept', 'application/json')
       .then(callback);

您还可以在一次调用中传入一个对象来设置多个字段：

     request
       .get('/search')
       .set({ 'API-Key': 'foobar', Accept: 'application/json' })
       .then(callback);

## `GET` 请求

`.query()` 方法接受对象，当与 __GET__ 方法一起使用时将形成一个查询字符串。以下将产生路径 `/search?query=Manny&range=1..5&order=desc`。
译者注：`.query()` 方法的参数不需要提前进行url编码。

     request
       .get('/search')
       .query({ query: 'Manny' })
       .query({ range: '1..5' })
       .query({ order: 'desc' })
       .then(res => {

       });

或传入单个对象：

    request
      .get('/search')
      .query({ query: 'Manny', range: '1..5', order: 'desc' })
      .then(res => {

      });

`.query()` 方法也可以接受字符串。

      request
        .get('/querystring')
        .query('search=Manny&range=1..5')
        .then(res => {

        });

或者一个个加入：

      request
        .get('/querystring')
        .query('search=Manny')
        .query('range=1..5')
        .then(res => {

        });

## `HEAD` 请求

您还可以对 __HEAD__ 请求使用 .query() 方法。以下将生成路径 `/users?email=joe@smith.com`。

      request
        .head('/users')
        .query({ email: 'joe@smith.com' })
        .then(res => {

        });

## `POST` / `PUT` 请求

一个典型的 JSON __POST__ 请求可能如下所示，我们适当地设置 `Content-Type` 请求头字段，并"写入"一些数据，在本例中只是一个 JSON 字符串。

      request.post('/user')
        .set('Content-Type', 'application/json')
        .send('{"name":"tj","pet":"tobi"}')
        .then(callback)
        .catch(errorCallback)

由于 JSON 无疑是最常见的，所以它是 _默认_ 的！下面的例子与前面的例子是等价的。

      request.post('/user')
        .send({ name: 'tj', pet: 'tobi' })
        .then(callback, errorCallback)

或者调用多个 `.send()`：

      request.post('/user')
        .send({ name: 'tj' })
        .send({ pet: 'tobi' })
        .then(callback, errorCallback)

默认情况下，发送字符串会将 `Content-Type` 设置为 `application/x-www-form-urlencoded`，多个调用将用 `&` 连接，这里产生 `name=tj&pet=tobi`：

      request.post('/user')
        .send('name=tj')
        .send('pet=tobi')
        .then(callback, errorCallback);

SuperAgent 格式是可扩展的，但默认情况下支持 "json" 和 "form"。要将数据作为 `application/x-www-form-urlencoded` 发送，只需在调用 `.type()` 时传入 "form"，默认为 "json"。此 __POST__ 请求的请求体将是 "name=tj&pet=tobi"。

      request.post('/user')
        .type('form')
        .send({ name: 'tj' })
        .send({ pet: 'tobi' })
        .then(callback, errorCallback)

还支持发送 [`FormData`](https://developer.mozilla.org/zh-CN/docs/Web/API/FormData/FormData) 对象。以下示例将 __POST__ 请求由 id="myForm" 标识的 HTML 表单的内容：

      request.post('/user')
        .send(new FormData(document.getElementById('myForm')))
        .then(callback, errorCallback)

## 设置 `Content-Type`

显而易见的解决方案是使用 `.set()` 方法：

     request.post('/user')
       .set('Content-Type', 'application/json')

`.type()` 方法也可以作为简写，接受带有类型/子类型的规范化 [MIME 类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 名称，或者只是扩展名，例如"xml"、"json"、"png"等：

     request.post('/user')
       .type('application/json')

     request.post('/user')
       .type('json')

     request.post('/user')
       .type('png')

## 序列化请求体

SuperAgent 将自动序列化 JSON 和表单。您也可以为其他类型设置自动序列化：

```js
request.serialize['application/xml'] = function (obj) {
    return '从obj生成的字符串';
};

// 接下来，内容类型为 "application/xml" 的所有请求都将自动序列化
```
如果您想以自定义格式发送 数据体(payload)，您可以根据每个请求将内置序列化替换为 `.serialize()` 方法：

```js
request
    .post('/user')
    .send({foo: 'bar'})
    .serialize(obj => {
        return '从obj生成的字符串';
    });
```
## 重试请求

如果请求暂时失败或可能是网络连接不稳定造成的失败，且当给定 `.retry()` 方法时，SuperAgent 将自动重试请求。

此方法有两个可选参数：重试次数（默认为 `1`）和回调函数。它在每次重试之前调用 callback(err, res) 。回调可以返回 `true`/`false` 以控制是否应重试请求（但始终应该用最大重试次数）。
     request
       .get('https://example.com/search')
       .retry(2) // 或者：
       .retry(2, callback) // 二选一
       .then(finished);
       .catch(failed);

`.retry()` 仅用于[*幂等*](https://baike.baidu.com/item/%E5%B9%82%E7%AD%89/8600688?fr=aladdin)请求（即到达服务器的多个请求不会导致重复购买等不良副作用）。

默认情况下会尝试所有请求方法（这意味着如果您不希望重试 POST 请求，则需要传递自定义的重试回调函数）。

默认情况下会重试以下状态代码：

* `408`
* `413`
* `429`
* `500`
* `502`
* `503`
* `504`
* `521`
* `522`
* `524`

默认情况下会重试以下错误代码：

* `'ETIMEDOUT'`
* `'ECONNRESET'`
* `'EADDRINUSE'`
* `'ECONNREFUSED'`
* `'EPIPE'`
* `'ENOTFOUND'`
* `'ENETUNREACH'`
* `'EAI_AGAIN'`

## 设置 Accept

与 `.type()` 方法类似，也可以通过简写方法 `.accept()` 设置 `Accept` 请求头。方便起见，其中还引用了 `request.types`，允许您将完整的规范化 [MIME 类型](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types) 名称指定为`类型/子类型`，或将扩展后缀形式指定为"xml"、"json"、"png"等：

     request.get('/user')
       .accept('application/json')

     request.get('/user')
       .accept('json')

     request.post('/user')
       .accept('png')

### Facebook 和 Accept JSON

如果您正在调用 Facebook 的 API，请务必在您的请求中发送 `Accept: application/json` 请求头。如果你不这样做，Facebook 会回复 `Content-Type: text/javascript; charset=UTF-8`，SuperAgent 将不会解析，因此 `res.body` 将是未定义的。您可以使用 `req.accept('json')` 或 `req.header('Accept', 'application/json')` 来执行此操作。有关详细信息，请参阅 [issue 1078](https://github.com/visionmedia/superagent/issues/1078)。

## 查询字符串(Query strings)

`req.query(obj)` 是一种可用于构建查询字符串的方法。例如在 __POST__ 上增加 `?format=json&dest=/login`：

    request
      .post('/')
      .query({ format: 'json' })
      .query({ dest: '/login' })
      .send({ post: 'data', here: 'wahoo' })
      .then(callback);

默认情况下，查询字符串不按任何特定顺序组装。可以使用 `req.sortQuery()` 启用 ASCIIbetically 排序的查询字符串。您还可以使用 `req.sortQuery(myComparisonFn)` 提供自定义排序比较函数。比较函数应该接受 2 个参数并返回一个负/零/正整数。

```js
 // 默认顺序
 request.get('/user')
   .query('name=Nick')
   .query('search=Manny')
   .sortQuery()
   .then(callback)

 // 自定义排序函数
 request.get('/user')
   .query('name=Nick')
   .query('search=Manny')
   .sortQuery((a, b) => a.length - b.length)
   .then(callback)
```

## TLS 选项

在 Node.js 中，SuperAgent 支持配置 HTTPS 请求的方法：

- `.ca()`: 将 CA 证书设置为信任
- `.cert()`: 设置客户端证书链
- `.key()`: 设置客户端私钥
- `.pfx()`: 设置客户端 PFX 或 PKCS12 编码的私钥和证书链
- `.disableTLSCerts()`: 不拒绝过期或无效的 TLS 证书。在内部设置 `rejectUnauthorized=true`。*请注意，此方法允许中间人攻击。*

有关更多信息，请参阅 Node.js [https.request 文档](http://nodejs.cn/api/https.html#httpsrequesturl-options-callback)。

```js
var key = fs.readFileSync('key.pem'),
    cert = fs.readFileSync('cert.pem');

request
  .post('/client-auth')
  .key(key)
  .cert(cert)
  .then(callback);
```

```js
var ca = fs.readFileSync('ca.cert.pem');

request
  .post('https://localhost/private-ca-server')
  .ca(ca)
  .then(res => {});
```

## 解析响应体

SuperAgent将为您解析已知的响应主体数据，目前支持`application/x-www-form-urlencoded`，`application/json`，以及`multipart/form data`。您可以设置自动解析其他响应主体数据：

```js
//浏览器
request.parse['application/xml'] = function (str) {
    return {'object': '从str解析的'};
};

//node
request.parse['application/xml'] = function (res, cb) {
    //解析响应文本并在此处设置res.body

    cb(null, res);
};

//接下来，将自动解析 'application/xml' 类型的响应
```

您可以使用 `.buffer(true).parse(fn)` 方法设置自定义解析器（优先于内置解析器）。如果未启用响应缓冲 (`.buffer(false)`)，则将触发`响应(response)`事件而无需等待正文解析器完成，因此 `response.body` 将不可用。

### JSON / Urlencoded

属性 `res.body` 是解析后的对象，例如，如果请求以 JSON 字符串 '{"user":{"name":"tobi"}}' 响应，则 `res.body.user.name` 将为 "tobi" .同样，"user[name]=tobi" 的 x-www-form-urlencoded 值将产生相同的结果。仅支持一级嵌套。如果您需要更复杂的数据，请改为发送 JSON。

通过重复的键发送数组。 `.send({color: ['red','blue']})` 会发送 `color=red&color=blue`。如果您希望数组键的名称中包含 `[]`，您必须自己添加它，因为 SuperAgent 不会自动添加它。

### Multipart

Node 客户端通过 [Formidable](https://github.com/felixge/node-formidable) 模块支持 _multipart/form-data_。解析 multipart 响应时，对象 `res.files` 也可供您使用。例如，假设一个请求使用以下 multipart 请求体进行响应：

    --whoop
    Content-Disposition: attachment; name="image"; filename="tobi.png"
    Content-Type: image/png

    ... data here ...
    --whoop
    Content-Disposition: form-data; name="name"
    Content-Type: text/plain

    Tobi
    --whoop--

`res.body.name`的值将为 "Tobi"，并且 `res.files.image` 将作为包含磁盘路径、文件名和其他属性的 `File` 对象。


### 二进制数据

在浏览器中，您可以使用 `.responseType('blob')` 来请求处理二进制响应体。在 node.js 中运行时不需要此 API。此方法支持的参数值为

- `'blob'` 赋值给 XmlHTTPRequest 的 `responseType` 属性
- `'arraybuffer'` 赋值给 XmlHTTPRequest 的 responseType 属性

```js
req.get('/binary.data')
  .responseType('blob')
  .then(res => {
    // res.body 将是浏览器原生 Blob 类型
  });
```

有关更多信息，请参阅 Mozilla 开发人员网络 [xhr.responseType 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType)。

## 响应属性

在 `Response` 对象上设置了许多有用的标志和属性，包括响应文本、解析的响应正文、响应头字段、状态标志等等。

### 响应文本

`res.text` 属性包含未解析的响应正文字符串。此属性始终存在于客户端 API 中，并且仅当默认情况下节点的 mime 类型与 "text/*"、"*/json" 或 "x-www-form-urlencoded" 匹配时。原因是为了节省内存，因为缓冲大型正文（例如 multipart 文件或图像）的文本效率极低。要强制缓冲，请参阅"[缓冲响应](#缓冲响应)"部分。

### 响应体

就像 SuperAgent 可以自动序列化请求数据一样，它也可以自动解析响应体。为 Content-Type 定义解析器时，会对其进行解析，默认情况下包括 "application/json" 和 "application/x-www-form-urlencoded"。然后可以通过 `res.body` 获得解析的对象。

### 响应头字段

`res.header` 包含已解析的响应头字段的对象，字段名称小写，就像 node 做的一样。例如 `res.header['content-length']`。

### 响应内容类型(Content-Type)

Content-Type 响应头是特殊情况，提供 `res.type`，它没有字符集（也可以有）。例如，"text/html; charset=utf8" 的 `Content-Type` 将提供 "text/html" 作为 `res.type`，然后 `res.charset` 属性将包含 "utf8"。

### 响应状态

响应状态标志有助于确定请求是否成功，以及其他有用的信息，使 SuperAgent 成为与 RESTful Web 服务交互的理想选择。这些标志当前定义为：

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

     // 语法糖
     res.accepted = 202 == status;
     res.noContent = 204 == status || 1223 == status;
     res.badRequest = 400 == status;
     res.unauthorized = 401 == status;
     res.notAcceptable = 406 == status;
     res.notFound = 404 == status;
     res.forbidden = 403 == status;

## 中止请求

要中止请求，只需调用 `req.abort()` 方法。

## 超时设定

有时网络和服务器会 "卡住" 并且在接受请求后从不响应。设置超时以避免请求永远等待。

  * `req.timeout({deadline:ms})` 或 `req.timeout(ms)`（其中 `ms` 是毫秒数 > 0）设置完成整个请求（包括所有上传、重定向、服务器处理时间）的最后期限。如果在这段时间内没有完全下载响应，则请求将被中止。

  * `req.timeout({response:ms})` 设置等待第一个字节从服务器到达的最长时间，但它不限制整个下载需要多长时间。响应超时应该至少比服务器响应的时间长几秒钟，因为它还包括进行 DNS 查找、TCP/IP 和 TLS 连接的时间，以及上传请求数据的时间。

您应该同时使用 `deadline` 和 `response` 超时。通过这种方式，您可以使用较短的响应超时来快速检测无响应的网络，并使用较长的截止时间来为缓慢但可靠的网络上的下载留出时间。请注意，这两个计时器都限制了允许*上传*附件的时间。如果您要上传文件，请使用长超时。

    request
      .get('/big-file?network=slow')
      .timeout({
        response: 5000,  // 等待 5 秒让服务器开始发送
        deadline: 60000, // 但允许文件用 1 分钟完成加载。
      })
      .then(res => {
          /* 及时响应 */
        }, err => {
          if (err.timeout) { /* 超时! */ } else { /* 其他错误 */ }
      });

超时错误有个 `.timeout` 属性。

## 验证

在 Node 和浏览器中都可以通过 `.auth()` 方法进行身份验证：

    request
      .get('http://local')
      .auth('tobi', 'learnboost')
      .then(callback);


在 _Node_ 客户端中，基本身份验证可以在 URL 中写成 "user:pass"：

    request.get('http://tobi:learnboost@local').then(callback);

默认情况下，仅使用`基本(Basic)`身份验证。在浏览器中，您可以添加 `{type:'auto'}` 以启用浏览器中内置的所有方法（Digest、NTLM 等）：

    request.auth('digest', 'secret', {type:'auto'})

`auth` 方法还支持一种`承载类型`，以指定基于令牌的身份验证：

    request.auth('my_token', { type: 'bearer' })

## 跟随重定向

默认情况下将跟随最多 5 个重定向，但是您可以使用 `res.redirects(n)` 方法指定它：

    const response = await request.get('/some.png').redirects(2);

超出限制的重定向被视为错误。使用 `.ok(res => res.status < 400)` 将它们读取为成功响应。

## 全局状态代理程序

### 保存 cookie

在 Node 中 SuperAgent 默认不保存 cookie，但您可以使用 `.agent()` 方法创建保存 cookie 的 SuperAgent 副本。每个副本都有一个单独的 cookie 储存器。

    const agent = request.agent();
    agent
      .post('/login')
      .then(() => {
        return agent.get('/cookied-page');
      });

在浏览器中，cookie 由浏览器自动管理，因此 `.agent()` 不会隔离 cookie。

### 多个请求的默认选项

代理程序上调用的常规请求方法将用作该代理发出的所有请求的默认值。

    const agent = request.agent()
      .use(plugin)
      .auth(shared);

    await agent.get('/with-plugin-and-auth'); // 带有插件和身份验证
    await agent.get('/also-with-plugin-and-auth'); // 也带有插件和身份验证

代理可以用来设置默认值的完整方法列表是：`use`、 `on`、 `once`、 `set`、 `query`、 `type`、 `accept`、 `auth`、 `withCredentials`、 `sortQuery`、 `retry`、 `ok`、 `redirects`、 `timeout`、 `buffer`、 `serialize`、 `parse`、 `ca`、 `key`、 `pfx`、 `cert`.

## 管道数据

Node 客户端允许您通过管道将数据传入和传出请求。请注意，使用 `.pipe()` **代替** `.end()/.then()` 方法。

管道文件的内容作为请求的例子：

    const request = require('superagent');
    const fs = require('fs');

    const stream = fs.createReadStream('path/to/my.json');
    const req = request.post('/somewhere');
    req.type('json');
    stream.pipe(req);

请注意，当您通过管道发送请求时，superagent 使用[分块传输编码](https://baike.baidu.com/item/%E5%88%86%E5%9D%97%E4%BC%A0%E8%BE%93%E7%BC%96%E7%A0%81/8359216?fr=aladdin)发送管道数据，并非所有服务器（例如 Python WSGI 服务器）都支持。

或将响应传送到文件：

    const stream = fs.createWriteStream('path/to/my.json');
    const req = request.get('/some.json');
    req.pipe(stream);

 不能混合使用管道和回调函数或 promises。请注意，您**不应**尝试通过管道传输 `.end()` 或 `Response` 对象的结果：

    // 别特么这么写：
    const stream = getAWritableStream();
    const req = request
      .get('/some.json')
      // BAD: 这会将无用信息管道传输到流中并以意想不到的方式失败
      .end((err, this_does_not_work) => this_does_not_work.pipe(stream))
    const req = request
      .get('/some.json')
      .end()
      // BAD: 这也不支持，调用 .end 之后调用 .pipe。
      .pipe(nope_its_too_late);

在 superagent 的[未来版本](https://github.com/visionmedia/superagent/issues/1188)中，对 `pipe()` 的不当调用将失败。

## 多部分请求

SuperAgent 也非常适合 _构建_ 它提供方法 `.attach()` 和 `.field()` 的多部分请求。

当您使用 `.field()` 或 `.attach()` 时，您不能使用 `.send()` 并且您*不能*设置 `Content-Type`（将为您设置正确的类型）。

### 附加文件

要发送文件，请使用 `.attach(name, [file], [options])`。您可以通过多次调用 `.attach` 来附加多个文件。参数是：

 * `name` — form 表单中的字段名。
 * `file` — 带有文件路径的字符串或 `Blob/Buffer` 对象。
 * `options` — （可选）自定义文件名的字符串或 `{filename: string}` 对象。在 Node 中也支持 `{contentType: 'mime/type'}`。在浏览器中创建一个具有适当类型的 `Blob`。
 
<br>

    request
      .post('/upload')
      .attach('image1', 'path/to/felix.jpeg')
      .attach('image2', imageBuffer, 'luna.jpeg')
      .field('caption', 'My cats')
      .then(callback);

### 字段值

与 HTML 中的表单字段非常相似，您可以使用 `.field(name, value)` 和 `.field({name: value})` 设置字段值。假设您想上传一些带有您的姓名和电子邮件的图片，您的请求可能如下所示：

     request
       .post('/upload')
       .field('user[name]', 'Tobi')
       .field('user[email]', 'tobi@learnboost.com')
       .field('friends[]', ['loki', 'jane'])
       .attach('image', 'path/to/tobi.png')
       .then(callback);

## 压缩

node 客户端支持压缩过的响应，最重要的是，您无需执行任何操作！它就能用。

## 缓冲响应

要强制将响应主体缓冲为 `res.text`，您可以调用 `req.buffer()`。要取消对文本响应（例如 "text/plain"、"text/html" 等）的默认缓冲，您可以调用 `req.buffer(false)`。 

当缓冲提供 `res.buffered` 标志时，您可以使用它在同一个回调中处理缓冲和非缓冲响应。

## CORS

出于安全原因，浏览器将阻止跨域请求，除非服务器选择使用 CORS 标头。浏览器还会发出额外的 __OPTIONS__ 请求来检查服务器允许哪些 HTTP 标头和方法。[阅读有关 CORS 的更多信息](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)。

`.withCredentials()` 方法支持从源发送 cookie，但仅当 Access-Control-Allow-Origin _不是_ 通配符 ("*") 且 `Access-Control-Allow-Credentials` 为 "true" 时。

    request
      .get('https://api.example.com:4001/')
      .withCredentials()
      .then(res => {
        assert.equal(200, res.status);
        assert.equal('tobi', res.text);
      })

## 错误处理

您的回调函数将始终传递两个参数：错误和响应。如果没有发生错误，第一个参数将为`null`：

    request
     .post('/upload')
     .attach('image', 'path/to/tobi.png')
     .then(res => {

     });

还会触发"错误"事件，您可以监听：

    request
      .post('/upload')
      .attach('image', 'path/to/tobi.png')
      .on('error', handle)
      .then(res => {

      });

请注意，**默认情况下，superagent 会考虑 4xx 和 5xx 响应（以及未处理的 3xx 响应）视为错误**。例如，如果您收到 `304 Not modified`、`403 Forbidden` 或 `500 Internal server` 错误响应，则此状态信息将通过 `err.status` 提供。来自此类响应的错误还包含一个 `err.response` 字段，其中包含"[响应属性](#响应属性)"中提到的所有属性。该库以这种方式运行以处理需要成功响应并将 HTTP 错误状态代码视为错误的常见情况，同时仍允许围绕特定错误条件进行自定义逻辑。

网络故障、超时和其他不产生响应的错误将不包含 `err.status` 或 `err.response` 字段。

如果您希望处理 404 或其他 HTTP 错误响应，您可以查询 `err.status` 属性。当发生 HTTP 错误（4xx 或 5xx 响应）时， `res.error` 属性是一个 `Error` 对象，这允许您执行以下检查：

    if (err && err.status === 404) {
      alert('oh no ' + res.body.message);
    }
    else if (err) {
      // 所有其他需要处理的错误类型
    }

或者，您可以使用 `.ok(callback)` 方法来确定响应是否为错误。 `ok` 函数的回调函数获得响应，如果响应应该被解释为成功，则返回 true。

    request.get('/404')
      .ok(res => res.status < 500)
      .then(response => {
        // 将 404 页面作为成功响应
      })

## 进度跟踪

SuperAgent 在上传和下载大文件时触发 `progress` 事件。

    request.post(url)
      .attach('field_name', file)
      .on('progress', event => {
        /* event的值：
        {
          direction: "upload" or "download"
          percent: 0 to 100 // 如果文件大小未知，可能会没有
          total: // 总文件大小，可能没有
          loaded: // 到目前为止下载或上传的字节数
        } */
      })
      .then()


## 在本地主机上测试

### 强制连接特定 IP 地址

在 Node.js 中，可以忽略 DNS 解析并使用 `.connect()` 方法将所有请求定向到特定 IP 地址。例如，此请求将转到 localhost 而不是 `example.com`：

    const res = await request.get("http://example.com").connect("127.0.0.1");

因为请求可能被重定向，所以可以指定多个主机名和多个 IP，以及一个特殊的 `*` 作为后备（注意：不支持其他通配符）。请求将保留其 `Host` 请求头的原始值。

    const res = await request.get("http://redir.example.com:555")
      .connect({
        "redir.example.com": "127.0.0.1", // redir.example.com:555 将使用 127.0.0.1:555
        "www.example.com": false, // 不覆盖这个；正常使用 DNS
        "mapped.example.com": { host: "127.0.0.1", port: 8080}, // mapped.example.com:* 将使用 127.0.0.1:8080
        "*": "proxy.example.com", // 所有其他请求都将发送到该主机
      });

### 忽略本地主机上损坏/不安全的 HTTPS

在 Node.js 中，当 HTTPS 配置错误且不安全（例如，使用自签名证书而*不指定*自己的 `.ca()`）时，仍然可以通过调用 `.trustLocalhost()` 来允许对 `localhost` 的请求：

    const res = await request.get("https://localhost").trustLocalhost()

与 `.connect("127.0.0.1")` 一起，这可用于强制将对任何域的 HTTPS 请求重新路由到 `localhost`。

忽略本地主机上损坏的 HTTPS 通常是安全的，因为环回接口不会暴露给不受信任的网络。信任 `localhost` 可能会成为未来的默认设置。使用 `.trustLocalhost(false)` 强制检查 `127.0.0.1` 的可靠性。

当向任何其他 IP 发出请求时，我们故意不支持禁用 HTTPS 安全性，因为这些选项最终被滥用为 HTTPS 问题的快速"修复"。您可以从 [Let's Encrypt](https://certbot.eff.org) 获得免费的 HTTPS 证书或设置您自己的 CA (`.ca(ca_public_pem)`) 以使您的自签名证书受信任。

## Promise 和生成器函数支持

SuperAgent 的请求是一个 "thenable" 对象(带有then方法的对象)，它与 JavaScript Promise 和 `async/await` 语法兼容。

    const res = await request.get(url);

如果你使用 Promise，**不要**调用 `.end()` 或 `.pipe()`。任何使用 `.then()` 或 `await` 都会禁用所有其他使用请求的方式。 像 [co](https://github.com/tj/co) 这样的库或像 [koa](https://github.com/koajs/koa) 这样的 web 框架可以在任何 SuperAgent 方法上 `yield`：

    const req = request
      .get('http://local')
      .auth('tobi', 'learnboost');
    const res = yield req;

请注意，SuperAgent 期望全局 `Promise` 对象存在。您需要一个 polyfill 才能在 Internet Explorer 或 Node.js 0.10 中使用 Promise。

## 浏览器和 node 版本

SuperAgent 有两种实现：一种用于 Web 浏览器（使用 XHR），另一种用于 Node.JS（使用核心 http 模块）。默认情况下，Browserify 和 WebPack 将选择浏览器版本。 

如果要使用 WebPack 为 Node.JS 编译代码，您*必须*在其配置中指定[node target](https://webpack.github.io/docs/configuration.html#target)。

### 在 electron 中使用浏览器版本

[Electron](https://electron.atom.io/) 开发人员报告说，如果您希望使用浏览器版本的 SuperAgent 而不是 Node 版本，您可以 `require('superagent/superagent')`。这样您的请求将显示在 Chrome 开发者工具的"网络(Network)"选项卡中。请注意，自动化测试套件未涵盖此环境，也未得到官方支持。

## 使用代理发送请求

可以使用另一个作者的 [superagent-proxy](https://www.npmjs.com/package/superagent-proxy) 模块

## 翻译说明

文档全部内容都是根据原英文文档翻译的，译者也没水平，所以如果有错误还请指出