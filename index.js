var postcss = require('postcss');
var fs = require('fs');

var R_ASSET = /asset\((.*?)([^\s'"]+)(.*?)\)/;

module.exports = function (options) {
  return function (css) {
    css.eachDecl(function (decl) {
      if (decl.value.indexOf('asset(') !== 0) return;
      var matches = decl.value.match(R_ASSET);
      var resolvedPath;
      options.loadPaths.some(function (loadPath) {
        resolvedPath = '/' + loadPath + matches[2];
        return fs.existsSync('test/fixtures' + resolvedPath);
      });
      decl.value = 'url(' + matches[1] + resolvedPath + matches[3] + ')';
    });
  };
};
