// var request = require('../support/client')
//   , express = require('express')
//   , assert = require('assert')
//   , app = express()
//   , fs = require('fs');

// app.get('/', function(req, res){
//   res.set('Content-Type', 'multipart/form-data; boundary=awesome');
//   // res.write('\r\n'); TODO: formidable bug
//   res.write('--awesome\r\n');
//   res.write('Content-Disposition: attachment; name="image"; filename="something.png"\r\n');
//   res.write('Content-Type: image/png\r\n');
//   res.write('\r\n');
//   res.write('some data');
//   res.write('\r\n--awesome\r\n');
//   res.write('Content-Disposition: form-data; name="name"\r\n');
//   res.write('Content-Type: text/plain\r\n');
//   res.write('\r\n');
//   res.write('tobi');
//   res.write('\r\n--awesome--');
//   setTimeout(function(){ // TODO: lolnode...
//     res.end();
//   }, 1000);
// });

// var base = 'http://localhost'
// var server;
// before(function listen(done) {
//   server = app.listen(0, function listening() {
//     base += ':' + server.address().port;
//     done();
//   });
// });

// describe('request multipart/form-data', function(){
//   describe('req.body', function(){
//     it('should be populated with fields', function(done){
//       request.get(base, function(err, res){
//         if (err) return done(err);
//         res.status.should.equal(200);
//         res.body.should.eql({ name: 'tobi' });
//         res.files.image.name.should.equal('something.png');
//         res.files.image.type.should.equal('image/png');
//         assert.equal(null, res.text, 'res.text should be empty for multipart');
//         done();
//       });
//     })
//   })
// })
