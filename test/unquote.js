/* eslint quotes: 0 */

import test from 'ava';
import unquote from '../lib/unquote';

test('removes quotes', (t) => {
  t.is(unquote('"foo"'), 'foo');
  t.is(unquote("'bar'"), 'bar');
});

test('preserves unquoted strings', (t) => {
  t.is(unquote('foo'), 'foo');
});
