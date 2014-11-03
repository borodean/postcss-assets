var test = require('tape');

var mapFunctions = require('../../lib/mapFunctions');

function compact(arr) {
  return Array.prototype.filter.call(arr, function (i) { return i; });
}

function checkArgs(t, input, expected, msg) {
  var actual = [];
  mapFunctions(input, function () {
    actual = actual.concat(compact(arguments));
  });
  t.deepEqual(actual, expected, msg);
}

test('mapFunctions', function (t) {

  checkArgs(t, 'url(kateryna.jpg)', ['kateryna.jpg'], 'parses unquoted param');
  checkArgs(t, 'url(\'kateryna.jpg\')', ['\'', 'kateryna.jpg'], 'parses single-quoted param');
  checkArgs(t, 'url("kateryna.jpg")', ['"', 'kateryna.jpg'], 'parses double-quoted param');
  checkArgs(t, 'url("kateryna_(shevchenko).jpg")', ['"', 'kateryna_(shevchenko).jpg'], 'parses param with parentheses');

  checkArgs(t, 'url("Gupsy Fortuneteller.jpg")', ['"', 'Gupsy Fortuneteller.jpg'], 'parses param with spaces');
  checkArgs(t, 'url(\'Baba O\\\'Riley.jpg\')', ['\'', 'Baba O\\\'Riley.jpg'], 'parses param escaped quotes');

  checkArgs(t, 'url(kateryna.jpg width)', ['kateryna.jpg', 'width'], 'parses unquoted param with modifier');
  checkArgs(t, 'url(kateryna.jpg  width)', ['kateryna.jpg', 'width'], 'parses unquoted param with modifier with extra space');
  checkArgs(t, 'url("kateryna.jpg" width)', ['"', 'kateryna.jpg', 'width'], 'parses quoted param with modifier');

  checkArgs(t, 'url(  kateryna.jpg )', ['  ', 'kateryna.jpg', ' '], 'parses extra space');

  checkArgs(t, '#000 url(kateryna.jpg) no-repeat', ['kateryna.jpg'], 'parses complex values');
  checkArgs(t, 'url(kateryna.jpg), url(odalisque.jpg)', ['kateryna.jpg', 'odalisque.jpg'], 'parses multiple values');

  t.end();
});
