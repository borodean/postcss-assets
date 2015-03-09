var expect = require('chai').expect;

var mapFunctions = require('../lib/map-functions');

var MAP = {
  'decrease': function (params) {
    return parseFloat(params, 10) - 1 + 'px';
  },
  'increase': function (params) {
    return parseFloat(params, 10) + 1 + 'px';
  },
  'double': function (params) {
    return parseFloat(params, 10) * 2 + 'px';
  },
  'combine': function (a, b) {
    return parseFloat(a, 10) + parseFloat(b, 10) + 'px';
  }
};

function checkMapping (source, expectedResult) {
  return function () {
    expect(mapFunctions(source, MAP)).to.equal(expectedResult);
  };
}

describe('mapFunctions()', function () {
  it('should map functions', checkMapping('increase(100px)', '101px'));
  it('should map sibling functions', checkMapping('increase(100px), decrease(100px)', '101px, 99px'));
  it('should map nested functions', checkMapping('double(increase(100px))', '202px'));
  it('should skip unknown functions', checkMapping('unknown(100px)', 'unknown(100px)'));
  it('should map inside unknown functions', checkMapping('unknown(increase(100px))', 'unknown(101px)'));
  it('should accept multiple parameters', checkMapping('combine(20px, 15px)', '35px'));
});
