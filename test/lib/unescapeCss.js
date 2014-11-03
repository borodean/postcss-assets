var test = require('tape');

var unescapeCss = require('../../lib/unescapeCss');

test('unescapeCss', function (t) {
  t.equal(unescapeCss('whatever'), 'whatever', 'does nothing');
  t.equal(unescapeCss('Romeo \\+ Juliette'), 'Romeo + Juliette', 'unescapes simple chars');
  t.equal(unescapeCss('\\34\\32'), '42', 'unescapes ASCII chars');
  t.equal(unescapeCss('I \\2665  NY'), 'I ♥ NY', 'unescapes Unicode chars');
  t.end();
});
