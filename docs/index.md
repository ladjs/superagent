# SuperAgent

 Super Agent 是个专注于灵活性、可读性的发展中的轻量型的ajax API，并在（作者）经受了许多现存的请求API折磨后（写出了该）有较低的学习曲线（的请求API）。

     request
       .post('/api/pet')
       .data({ name: 'Manny', species: 'cat' })
       .set('X-API-Key', 'foobar')
       .set('Accept', 'application/json')
       .end(function(res){
         if (res.ok) {
           alert('yay got ' + JSON.stringify(res.body));
         } else {
           alert('Oh no! error ' + res.text);
         }
       });

## 请求基础

 请求可以通过在 `request` 对象上调用对应的方法初始化，然后调用 `.end()` （方法）来发送请求。例如（这个）简单的GET请求：
 
     request
       .get('/search')
       .end(function(res){
       
       });

 该 __node__ 客户端也可以提供绝对url（路径）：

     request
       .get('http://example.com/search')
       .end(function(res){
     
       });

  __DELETE__, __HEAD__, __POST__, __PUT__ 和其他 __HTTP__ 动词也可以被使用，简单的改变方法名（即可）：
  
    request
      .head('/favicon.ico')
      .end(function(res){
      
      });

  __DELETE__ 这个比较特殊，因为它是个保留字，因此方法名为 `.del()` ：
  
    request
      .del('/user/1')
      .end(function(res){
        
      });

### 各种各样的请求

SuperAgent的灵活的API在你 __需要__ 的时候给你需要的粒度，更多简洁的变化帮助你在必要（的时候）减少代码总量。比如接下来该GET请求：
  
    request
      .get('/search')
      .end(function(res){
    
      });

  也可以被定义如下，一个回调（函数）被给予到这个HTTP动词方法：
  
    request
      .get('/search', function(res){
    
      });

   更进一步默认的HTTP动词是 __GET__ 因此接下来的（代码）也可一样工作：
   
     request('/search', function(res){
 
     });

   这也可以应用到更复杂的请求上，比如接下来这个带查询字符串的 __GET__ 请求可以以链式方法写：
   
     request
       .get('/search')
       .data({ query: 'tobi the ferret' })
       .end(function(res){
         
       });

   或者也可以传入查询字符串到 `.get()` （方法）：
   
     request
       .get('/search', { query: 'tobi the ferret' })
       .end(function(res){
       
       });
  
  更进一步处理则回调函数也可以一起传入：
  
     request
       .get('/search', { query: 'tobi the ferret' }, function(res){
     
       });

## 处理错误

  在（出现）网络错误（例如：链接拒绝或超时）时，SuperAgent发出 `error` 事件除非你传入带两个参数的回调到 `.end()` （方法）。然后SuperAgent将用错误信息为第一个（参数），接着为一个null响应（的参数）调用它。

     request
       .get('http://wrongurl')
       .end(function(err, res){
         console.log('ERROR: ', err)
       });

  在HTTP错误时，SuperAgent带标志填充响应以说明（是哪种）错误。查看下面的`Response status`（以了解详情）。

## 设置header字段

  设置header字段很简单，以一个字段名及值调用 `.set()` （方法即可）：
  
     request
       .get('/search')
       .set('API-Key', 'foobar')
       .set('Accept', 'application/json')
       .end(callback);

## GET 请求

 `.data()` 方法接受对象（参数），在与 __GET__ 方法一起使用时将形成查询字符串。接下来（的代码）将生成路径 `/search?query=Manny&range=1..5&order=desc` 。

     request
       .get('/search')
       .data({ query: 'Manny' })
       .data({ range: '1..5' })
       .data({ order: 'desc' })
       .end(function(res){

       });

   `.data()` 方法也接受字符串（参数）：
  
      request
        .get('/querystring')
        .data('search=Manny&range=1..5')
        .end(function(res){

        });

### POST / PUT 请求

  一个典型的JSON __POST__ 请求可能看起来像这样，我们在这里设置了对应的Content-Type header 字段及 "write" 一些数据，在这个例子里只是个JSON字符串。

      request.post('/user')
        .set('Content-Type', 'application/json')
        .data('{"name":"tj","pet":"tobi"})
        .end(callback)

  因为JSON无疑是最普遍（使用的），（所以）它是 _默认_ 的！接下来的例子和前面的是等同的。

      request.post('/user')
        .data({ name: 'tj', pet: 'tobi' })
        .end(callback)

  或者使用多次  `.data()` 调用：
  
      request.post('/user')
        .data({ name: 'tj' })
        .data({ pet: 'tobi' })
        .end(callback)

  SuperAgent格式是可扩展的，不过默认支持 "json" 和 "form"。 简单的带"form-data"参数调用 `.type()` 来发送 `application/x-www-form-urlencoded` 数据，默认参数是“json”。该请求将POST该body "name=tj&pet=tobi"。

      request.post('/user')
        .type('form')
        .data({ name: 'tj' })
        .data({ pet: 'tobi' })
        .end(callback)

## 响应属性

  许多有帮助的标志和属性被设置在`Response`对象上，包括响应文本、解析后的响应体、header字段、状态标志及其它。
  
### 响应文本

  这个 `res.text` 属性包含未解析的响应体字符串。

### 响应体

  类似SuperAgent能自动序列化请求数据，也能自动解析它。当某种Content-Type的解析器被定义时，它将被解析，默认已经有"application/json" and "application/x-www-form-urlencoded"。该解析过的对象将可通过`res.body`获得。

### 响应header字段

  该 `res.header` 包含一个解析过的header字段，类似node的做法，将字段名都小写化。例如 `res.header['content-length']`。

### 响应 Content-Type

  该 Content-Type 响应header是个特例，提供的`res.contentType`没有字符集。比如"text/html; charset=utf8"的Content-Type将设置 "text/html" 为 `res.contentType`，而`res.charset`属性将包含"utf8"。

### 响应状态

  该响应状态标志帮助确定该请求是否成功，当中的其它有用的信息，使得SuperAgent是作为与RESTful web服务交互的理想（工具）。这些标志当前定义为：

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
