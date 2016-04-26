var setup = require('../support/setup');
var base = setup.uri;

var assert = require('assert');
var request = require('../../');

describe('request', function(){
  describe('on redirect', function(){
    it('should follow Location', function(done){
      var redirects = [];

      request
      .get(base)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          arr.push('/movies');
          arr.push('/movies/all');
          arr.push('/movies/all/0');
          redirects.should.eql(arr);
          res.text.should.equal('first movie page');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should not follow on HEAD by default', function(done){
      var redirects = [];

      request.head(base)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          redirects.should.eql([]);
          res.status.should.equal(302);
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should follow on HEAD when redirects are set', function(done){
      var redirects = [];

      request.head(base)
      .redirects(10)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          arr.push('/movies');
          arr.push('/movies/all');
          arr.push('/movies/all/0');
          redirects.should.eql(arr);
          assert(!res.text);
          done();
        } catch(err) {
          done(err);
        }
      });
    });

    it('should remove Content-* fields', function(done){
      request
      .post(base + '/header')
      .type('txt')
      .set('X-Foo', 'bar')
      .set('X-Bar', 'baz')
      .send('hey')
      .end(function(err, res){
        try {
          assert(res.body);
          res.body.should.have.property('x-foo', 'bar');
          res.body.should.have.property('x-bar', 'baz');
          res.body.should.not.have.property('content-type');
          res.body.should.not.have.property('content-length');
          res.body.should.not.have.property('transfer-encoding');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should retain cookies', function(done){
      request
      .get(base + '/header')
      .set('Cookie', 'foo=bar;')
      .end(function(err, res){
        try {
          assert(res.body);
          res.body.should.have.property('cookie', 'foo=bar;');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should not resend query parameters', function(done) {
      var redirects = [];
      var query = [];

      request
      .get(base + '/?foo=bar')
      .on('redirect', function(res){
        query.push(res.headers.query);
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          arr.push('/movies');
          arr.push('/movies/all');
          arr.push('/movies/all/0');
          redirects.should.eql(arr);
          res.text.should.equal('first movie page');

          query.should.eql(['{"foo":"bar"}', '{}', '{}']);
          res.headers.query.should.eql('{}');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    it('should handle no location header', function(done){
      request
      .get(base + '/bad-redirect')
      .end(function(err, res){
        try {
          err.message.should.equal('No location header for redirect');
          done();
        } catch(err) {
          done(err);
        }
      });
    })

    describe('when relative', function(){
      it('should redirect to a sibling path', function(done){
        var redirects = [];

        request
        .get(base + '/relative')
        .on('redirect', function(res){
          redirects.push(res.headers.location);
        })
        .end(function(err, res){
          try {
            redirects.should.eql(['tobi']);
            res.text.should.equal('tobi');
            done();
          } catch(err) {
            done(err);
          }
        });
      })

      it('should redirect to a parent path', function(done){
        var redirects = [];

        request
        .get(base + '/relative/sub')
        .on('redirect', function(res){
          redirects.push(res.headers.location);
        })
        .end(function(err, res){
          try {
            redirects.should.eql(['../tobi']);
            res.text.should.equal('tobi');
            done();
          } catch(err) {
            done(err);
          }
        });
      })
    })
  })

  describe('req.redirects(n)', function(){
    it('should alter the default number of redirects to follow', function(done){
      var redirects = [];

      request
      .get(base)
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          assert(res.redirect, 'res.redirect');
          arr.push('/movies');
          arr.push('/movies/all');
          redirects.should.eql(arr);
          res.text.should.match(/Moved Temporarily|Found/);
          done();
        } catch(err) {
          done(err);
        }
      });
    })
  })

  describe('on POST', function(){
    it('should redirect as GET', function(done){
      var redirects = [];

      request
      .post(base + '/movie')
      .send({ name: 'Tobi' })
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          arr.push('/movies/all/0');
          redirects.should.eql(arr);
          res.text.should.equal('first movie page');
          done();
        } catch(err) {
          done(err);
        }
      });
    })
  })

  describe('on POST using multipart/form-data', function(){
    it('should redirect as GET', function(done){
      var redirects = [];

      request
      .post(base + '/movie')
      .type('form')
      .field('name', 'Tobi')
      .redirects(2)
      .on('redirect', function(res){
        redirects.push(res.headers.location);
      })
      .end(function(err, res){
        try {
          var arr = [];
          arr.push('/movies/all/0');
          redirects.should.eql(arr);
          res.text.should.equal('first movie page');
          done();
        } catch(err) {
          done(err);
        }
      });
    })
  })

})
