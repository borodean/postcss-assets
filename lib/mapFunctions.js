const R_FUNC = /(url|width|height|size)\((\s*)((['"]?).*?\4.*?)(\s*)\)/gi;
const R_PARAMS = /^(['"]?)(.+?)\1(?:\s+(.+))?$/;

module.exports = function mapFunctions(cssValue, callback) {
  return cssValue.replace(R_FUNC, function (matches, name, before, params, quote, after) {
    params = params.match(R_PARAMS);
    var assetStr = params[2];
    var modifier = params[3];
    var result = callback(name, before, quote, assetStr, modifier, after);
    return result || matches;
  });
};
