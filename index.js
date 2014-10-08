var postcss = require('postcss');

var fs = require('fs');
var path = require('path');

var R_ASSET = /asset\((\s*['"]?)(.*?)(['"]?\s*)\)/;
var R_URL = /^([^\?#]+)(.*)/;

module.exports = function (options) {
  options.loadPaths = options.loadPaths || [];
  options.loadPaths.unshift('./');

  function resolve(fn) {
    var chunks = Array.prototype.slice.call(fn.match(R_URL), 1, 3);
    var resolvedPathname;
    var some = options.loadPaths.some(function (loadPath) {
      resolvedPathname = path.normalize('/' + loadPath + chunks[0]);
      return fs.existsSync(options.basePath + resolvedPathname);
    });
    if (!some) throw new Error;
    chunks[0] = encodeURI(resolvedPathname);
    return chunks.join('');
  }

  return function (css) {
    css.eachDecl(function (decl) {
      if (decl.value.indexOf('asset(') !== 0) return;
      var matches = decl.value.match(R_ASSET);
      decl.value = 'url(' + matches[1] + resolve(matches[2]) + matches[3] + ')';
    });
  };
};
