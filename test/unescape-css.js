import test from 'ava';
import unescapeCss from '../lib/unescape-css';

test('unescapes plain chars', (t) => {
  t.is(unescapeCss('Romeo \\+ Juliette'), 'Romeo + Juliette');
});

test('unescapes ASCII chars', (t) => {
  t.is(unescapeCss('\\34\\32'), '42');
});

test('unescapes Unicode chars', (t) => {
  t.is(unescapeCss('I \\2665  NY'), 'I ♥ NY');
});
