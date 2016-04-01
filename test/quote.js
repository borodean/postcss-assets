/* eslint quotes: 0 */

import quote from '../lib/quote';
import test from 'ava';

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
