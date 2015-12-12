var expect = require('chai').expect;
var unquote = require('../lib/unquote');

describe('unquote()', function () {
  it('removes quotes', function () {
    expect(unquote('"foo"')).to.equal('foo');
    expect(unquote('\'bar\'')).to.equal('bar');
  });

  it('preserves unquoted strings', function () {
    expect(unquote('foo')).to.equal('foo');
  });
});
