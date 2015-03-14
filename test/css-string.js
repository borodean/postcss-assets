  // Vendor imports
var expect = require('chai').expect;

// Local imports
var CSSString = require('../lib/css-string');

describe('CSSString', function () {
  it('should properly split quotes from value', function () {
    var unquoted = new CSSString('foobar');
    expect(unquoted.quotes).to.equal('');

    var singleQuoted = new CSSString('\'foobar\'');
    expect(singleQuoted.quotes).to.equal('\'');

    var doubleQuoted = new CSSString('"foobar"');
    expect(doubleQuoted.quotes).to.equal('"');
  });

  it('should convert double quotes to single', function () {
    var doubleQuoted = new CSSString('"foobar"');
    expect(doubleQuoted.toString()).to.equal('\'foobar\'');
  });

  it('should leave unquoted string as they were', function () {
    var unquoted = new CSSString('foobar');
    expect(unquoted.toString()).to.equal('foobar');
  });

  it('should force quotes when any quotes were added to the value', function () {
    var unquoted = new CSSString('foobar');
    unquoted.value = 'foo\'bar';
    expect(unquoted.toString()).to.equal('\'foo\'bar\'');
  });
});
