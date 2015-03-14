  // Vendor imports
var expect = require('chai').expect;

// Local imports
var mapFunctions = require('../lib/map-functions');

function test(source, expectedResult) {
  return function () {
    var actualResult = mapFunctions(source, {
      decrease: function (params) {
        return parseFloat(params, 10) - 1 + 'px';
      },
      increase: function (params) {
        return parseFloat(params, 10) + 1 + 'px';
      },
      double: function (params) {
        return parseFloat(params, 10) * 2 + 'px';
      },
      combine: function (a, b) {
        return parseFloat(a, 10) + parseFloat(b, 10) + 'px';
      }
    });
    expect(actualResult).to.equal(expectedResult);
  };
}

describe('mapFunctions()', function () {
  it('should map functions', test('increase(100px)', '101px'));
  it('should map sibling functions', test('increase(100px), decrease(100px)', '101px, 99px'));
  it('should map nested functions', test('double(increase(100px))', '202px'));
  it('should skip unknown functions', test('unknown(100px)', 'unknown(100px)'));
  it('should map inside unknown functions', test('unknown(increase(100px))', 'unknown(101px)'));
  it('should accept multiple parameters', test('combine(20px, 15px)', '35px'));
});
