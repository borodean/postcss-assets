var postcss = require('postcss');

var fs = require('fs');
var path = require('path');

var R_ASSET = /asset\((.*?)([^\s'"]+)(.*?)\)/;

module.exports = function (options) {
  options.loadPaths = options.loadPaths || [];
  options.loadPaths.unshift('./');
  return function (css) {
    css.eachDecl(function (decl) {
      if (decl.value.indexOf('asset(') !== 0) return;
      var matches = decl.value.match(R_ASSET);
      var resolvedPath;
      var some = options.loadPaths.some(function (loadPath) {
        resolvedPath = path.normalize('/' + loadPath + matches[2]);
        return fs.existsSync(options.basePath + resolvedPath);
      });
      if (!some) throw new Error;
      decl.value = 'url(' + matches[1] + resolvedPath + matches[3] + ')';
    });
  };
};
