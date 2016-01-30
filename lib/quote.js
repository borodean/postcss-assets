/* eslint quotes: 0 */

var util = require('util');

var R_QUOTES = /'/g;

module.exports = function (string) {
  if (string[0] === "'" || string[0] === '"') {
    return string;
  }
  return util.format("'%s'", string.replace(R_QUOTES, function (match, offset, string) {
    if (string[offset - 1] === '\\') {
      return match;
    }
    return '\\' + match;
  }));
};
