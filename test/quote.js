/* eslint quotes: 0 */

const test = require('ava');
const quote = require('../lib/quote');

test('adds quotes', (t) => {
  t.is(quote("foo"), "'foo'");
});

test('preserves quoted strings', (t) => {
  t.is(quote("'foo'"), "'foo'");
  t.is(quote('"foo"'), '"foo"');
});

test('escapes inner quotes', (t) => {
  t.is(quote("foo'bar'baz"), "'foo\\'bar\\'baz'");
});

test('preserves already escaped quotes', (t) => {
  t.is(quote("foo\\'bar\\'baz"), "'foo\\'bar\\'baz'");
});
