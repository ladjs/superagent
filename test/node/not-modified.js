var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;

describe('request', function(){
  describe('not modified', function(){
    var ts;
    it('should start with 200', function(done){
      request
      .get(base + '/if-mod')
      .end(function(err, res){
        res.should.have.status(200)
        res.text.should.match(/^\d+$/);
        ts = +res.text;
        done();
      });
    })

    it('should then be 304', function(done){
      request
      .get(base + '/if-mod')
      .set('If-Modified-Since', new Date(ts).toUTCString())
      .end(function(err, res){
        res.should.have.status(304)
        // res.text.should.be.empty
        done();
      });
    });
  })
})
