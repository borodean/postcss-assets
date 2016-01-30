var test = require('ava');
var unescapeCss = require('../lib/unescape-css');

test('unescapes plain chars', function (t) {
  t.is(unescapeCss('Romeo \\+ Juliette'), 'Romeo + Juliette');
});

test('unescapes ASCII chars', function (t) {
  t.is(unescapeCss('\\34\\32'), '42');
});

test('unescapes Unicode chars', function (t) {
  t.is(unescapeCss('I \\2665  NY'), 'I ♥ NY');
});
