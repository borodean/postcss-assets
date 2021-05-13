/* eslint quotes: 0 */

const test = require('ava');
const unquote = require('../lib/unquote');

test('removes quotes', (t) => {
  t.is(unquote('"foo"'), 'foo');
  t.is(unquote("'bar'"), 'bar');
});

test('preserves unquoted strings', (t) => {
  t.is(unquote('foo'), 'foo');
});
