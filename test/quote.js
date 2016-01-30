/* eslint quotes: 0 */

var expect = require('chai').expect;
var quote = require('../lib/quote');

describe('quote()', function () {
  it('adds quotes', function () {
    expect(quote("foo")).to.equal("'foo'");
  });

  it('preserves quoted strings', function () {
    expect(quote("'foo'")).to.equal("'foo'");
    expect(quote('"foo"')).to.equal('"foo"');
  });

  it('escapes inner quotes', function () {
    expect(quote("foo'bar'baz")).to.equal("'foo\\'bar\\'baz'");
  });

  it('preserves already escaped quotes', function () {
    expect(quote("foo\\'bar\\'baz")).to.equal("'foo\\'bar\\'baz'");
  });
});
