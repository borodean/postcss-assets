const R_FUNC = /(url|width|height|size)\((\s*)(['"]?)(.*?)\3(\s*)\)/gi;

module.exports = function mapFunctions(cssValue, callback) {
  return cssValue.replace(R_FUNC, function (matches, name, before, quote, params, after) {
    var result = callback(name, before, quote, params, after);
    return result || matches;
  });
};
