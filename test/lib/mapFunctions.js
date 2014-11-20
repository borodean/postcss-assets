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

  checkArgs(t, 'url(kateryna.jpg)', ['url', 'kateryna.jpg'], 'parses unquoted param');
  checkArgs(t, 'url(\'kateryna.jpg\')', ['url', '\'', 'kateryna.jpg'], 'parses single-quoted param');
  checkArgs(t, 'url("kateryna.jpg")', ['url', '"', 'kateryna.jpg'], 'parses double-quoted param');
  checkArgs(t, 'url("kateryna_(shevchenko).jpg")', ['url', '"', 'kateryna_(shevchenko).jpg'], 'parses param with parentheses');

  checkArgs(t, 'url("Gupsy Fortuneteller.jpg")', ['url', '"', 'Gupsy Fortuneteller.jpg'], 'parses param with spaces');
  checkArgs(t, 'url(\'Baba O\\\'Riley.jpg\')', ['url', '\'', 'Baba O\\\'Riley.jpg'], 'parses param escaped quotes');

  checkArgs(t, 'url(kateryna.jpg width)', ['url', 'kateryna.jpg', 'width'], 'parses unquoted param with modifier');
  checkArgs(t, 'url(kateryna.jpg  width)', ['url', 'kateryna.jpg', 'width'], 'parses unquoted param with modifier with extra space');
  checkArgs(t, 'url("kateryna.jpg" width)', ['url', '"', 'kateryna.jpg', 'width'], 'parses quoted param with modifier');

  checkArgs(t, 'url(  kateryna.jpg )', ['url', '  ', 'kateryna.jpg', ' '], 'parses extra space');

  checkArgs(t, '#000 url(kateryna.jpg) no-repeat', ['url', 'kateryna.jpg'], 'parses complex values');
  checkArgs(t, 'url(kateryna.jpg), url(odalisque.jpg)', ['url', 'kateryna.jpg', 'url', 'odalisque.jpg'], 'parses multiple values');

  checkArgs(t, 'width(kateryna.jpg), height(kateryna.jpg), size(kateryna.jpg)', ['width', 'kateryna.jpg', 'height', 'kateryna.jpg', 'size', 'kateryna.jpg'], 'accepts different function names');

  t.end();
});
