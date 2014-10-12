const R_FUNC = /url\((\s*)((['"]?).*?\3.*?)(\s*)\)/gi;
const R_PARAMS = /^(['"]?)(.+?)\1(?:\s+(.+))?$/;

module.exports = function mapFunctions(cssValue, callback) {
  return cssValue.replace(R_FUNC, function (matches, before, params, quote, after) {
    params = params.match(R_PARAMS);
    var assetStr = params[2];
    var modifier = params[3];
    return callback(before, quote, assetStr, modifier, after);
  });
}
