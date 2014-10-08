var postcss = require('postcss');

var fs = require('fs');
var path = require('path');

var R_ASSET = /asset\((\s*['"]?)(.*?)(['"]?\s*)\)/;
var R_ESCAPE = /\\(?:([0-9a-f]{1,6} ?)|(.))/g;
var R_URL = /^([^\?#]+)(.*)/;

module.exports = function (options) {
  options.loadPaths = options.loadPaths || [];
  options.loadPaths.unshift('./');

  function resolve(fn) {
    var chunks = Array.prototype.slice.call(fn.match(R_URL), 1, 3);
    var resolvedPath;
    var some = options.loadPaths.some(function (loadPath) {
      resolvedPath = path.normalize('/' + loadPath);
      return fs.existsSync(options.basePath + resolvedPath + unescape(chunks[0]));
    });
    if (!some) throw new Error;
    chunks[0] = encodeURI(resolvedPath + chunks[0]).replace('%5C', '\\');
    return chunks.join('');
  }

  function unescape(string) {
    return string.replace(R_ESCAPE, function (match, p1, p2) {
      if (p1) return String.fromCharCode(p1);
      return p2;
    });
  }

  return function (css) {
    css.eachDecl(function (decl) {
      if (decl.value.indexOf('asset(') !== 0) return;
      var matches = decl.value.match(R_ASSET);
      decl.value = 'url(' + matches[1] + resolve(matches[2]) + matches[3] + ')';
    });
  };
};
