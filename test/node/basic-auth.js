var request = require('../../');
var setup = require('../support/setup');
var base = setup.uri;
var URL = require('url');

describe('Basic auth', function(){
  describe('when credentials are present in url', function(){
    it('should set Authorization', function(done){
      var new_url = URL.parse(base);
      new_url.auth = 'tobi:learnboost';
      new_url.pathname = '/basic-auth';

      request
      .get(URL.format(new_url))
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user, pass)', function(){
    it('should set Authorization', function(done){
      request
      .get(base + '/basic-auth')
      .auth('tobi', 'learnboost')
      .end(function(err, res){
        res.status.should.equal(200);
        done();
      });
    })
  })

  describe('req.auth(user + ":" + pass)', function(){
    it('should set authorization', function(done){
      request
      .get(base + '/basic-auth/again')
      .auth('tobi')
      .end(function(err, res){
        res.status.should.eql(200);
        done();
      });
    })
  })
})
