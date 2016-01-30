/* eslint quotes: 0 */

var quote = require('../lib/quote');
var test = require('ava');

test('adds quotes', function (t) {
  t.is(quote("foo"), "'foo'");
});

test('preserves quoted strings', function (t) {
  t.is(quote("'foo'"), "'foo'");
  t.is(quote('"foo"'), '"foo"');
});

test('escapes inner quotes', function (t) {
  t.is(quote("foo'bar'baz"), "'foo\\'bar\\'baz'");
});

test('preserves already escaped quotes', function (t) {
  t.is(quote("foo\\'bar\\'baz"), "'foo\\'bar\\'baz'");
});
