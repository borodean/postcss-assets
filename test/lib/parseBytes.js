var test = require('tape');

var parseBytes = require('../../lib/parseBytes');

test('parseBytes', function (t) {
  t.equal(parseBytes(128), 128, 'converts numbers');
  t.equal(parseBytes('128'), 128, 'converts unitless values');
  t.equal(parseBytes('2k'), 2048, 'converts kilobytes');
  t.equal(parseBytes('3K'), 3072, 'converts uppercase units');
  t.equal(parseBytes('2m'), 2097152, 'converts megabytes');
  t.equal(parseBytes('25.5k'), 26112, 'converts fractional numbers');
  t.end();
});
