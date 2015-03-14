// Vendor imports
var expect = require('chai').expect;

// Local imports
var unescapeCss = require('../lib/unescape-css');

describe('unescapeCss()', function () {
  it('should unescape plain chars', function () {
    expect(unescapeCss('Romeo \\+ Juliette')).to.equal('Romeo + Juliette');
  });

  it('should unescape ASCII chars', function () {
    expect(unescapeCss('\\34\\32')).to.equal('42');
  });

  it('should unescape Unicode chars', function () {
    expect(unescapeCss('I \\2665  NY')).to.equal('I ♥ NY');
  });
});
