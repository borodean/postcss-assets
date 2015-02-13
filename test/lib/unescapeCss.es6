var expect = require('chai').expect;

var unescapeCss = require('../../lib/unescapeCss');

describe('unescapeCss', function () {
  it('does nothing', function () {
    expect(unescapeCss('whatever')).to.equal('whatever');
  });

  it('unescapes simple chars', function () {
    expect(unescapeCss('Romeo \\+ Juliette')).to.equal('Romeo + Juliette');
  });

  it('unescapes ASCII chars', function () {
    expect(unescapeCss('\\34\\32')).to.equal('42');
  });

  it('unescapes Unicode chars', function () {
    expect(unescapeCss('I \\2665  NY')).to.equal('I ♥ NY');
  });
});
