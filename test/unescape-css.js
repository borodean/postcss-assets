var test = require('ava');
var unescapeCss = require('../lib/unescape-css');

test('should unescape plain chars', function (t) {
  t.is(unescapeCss('Romeo \\+ Juliette'), 'Romeo + Juliette');
});

test('should unescape ASCII chars', function (t) {
  t.is(unescapeCss('\\34\\32'), '42');
});

test('should unescape Unicode chars', function (t) {
  t.is(unescapeCss('I \\2665  NY'), 'I ♥ NY');
});
