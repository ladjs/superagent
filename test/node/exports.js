
/**
 * Module dependencies.
 */

var request = require('../../');

describe('exports', function(){
  it('should expose .version', function(){
    request.version.should.be.a('string');
  })
  
  it('should expose Part', function(){
    request.Part.should.be.a('function');
  })
  
  it('should expose .protocols', function(){
    Object.keys(request.protocols)
      .should.eql(['http:', 'https:']);
  })

  it('should expose .types', function(){
    Object.keys(request.types)
      .should.eql(['html', 'json', 'urlencoded', 'form-data']);
  })
})