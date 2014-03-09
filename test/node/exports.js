
var request = require('../../');

describe('exports', function(){
  it('should expose Part', function(){
    request.Part.should.be.a.function;
  })
  
  it('should expose .protocols', function(){
    Object.keys(request.protocols)
      .should.eql(['http:', 'https:']);
  })

  it('should expose .serialize', function(){
    Object.keys(request.serialize)
      .should.eql(['application/x-www-form-urlencoded', 'application/json']);
  })
  
  it('should expose .parse', function(){
    Object.keys(request.parse)
      .should.eql(['application/x-www-form-urlencoded', 'application/json', 'text']);
  })
})
