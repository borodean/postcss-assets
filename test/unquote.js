/* eslint quotes: 0 */

var test = require('ava');
var unquote = require('../lib/unquote');

test('removes quotes', function (t) {
  t.is(unquote('"foo"'), 'foo');
  t.is(unquote("'bar'"), 'bar');
});

test('preserves unquoted strings', function (t) {
  t.is(unquote('foo'), 'foo');
});
