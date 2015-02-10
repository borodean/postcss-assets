var test = require('tape');

var mapFunctions = require('../../lib/mapFunctions');

const MAP = {
  'decrease': function (params) {
    return parseFloat(params, 10) - 1 + 'px';
  },
  'increase': function (params) {
    return parseFloat(params, 10) + 1 + 'px';
  },
  'double': function (params) {
    return parseFloat(params, 10) * 2 + 'px';
  },
  'url': function (params) {
    return 'url(https://github.com/' + params + ')';
  },
  'combine': function (a, b) {
    return parseFloat(a, 10) + parseFloat(b, 10) + 'px';
  }
};

function checkMapping (t, source, expectedResult, msg) {
  t.equal(mapFunctions(source, MAP), expectedResult, msg);
}

test('mapFunctions', function (t) {
  checkMapping(t,
    'increase(100px)',
    '101px',
    'maps functions'
  );

  checkMapping(t,
    'increase(100px), decrease(100px)',
    '101px, 99px',
    'maps sibling functions'
  );

  checkMapping(t,
    'double(increase(100px))',
    '202px',
    'maps nested functions'
  );

  checkMapping(t,
    'unknown(100px)',
    'unknown(100px)',
    'skips unknown functions'
  );

  checkMapping(t,
    'unknown(increase(100px))',
    'unknown(101px)',
    'maps inside unknown functions'
  );

  checkMapping(t,
    'combine(20px, 15px)',
    '35px',
    'accepts multiple parameters'
  );

  t.end();
});
