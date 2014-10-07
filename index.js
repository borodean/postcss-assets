var postcss = require('postcss');

var fs = require('fs');
var path = require('path');
var url = require('url');

var R_ASSET = /asset\((.*?)([^\s'"]+)(.*?)\)/;

module.exports = function (options) {
  options.loadPaths = options.loadPaths || [];
  options.loadPaths.unshift('./');
  return function (css) {
    css.eachDecl(function (decl) {
      if (decl.value.indexOf('asset(') !== 0) return;
      var matches = decl.value.match(R_ASSET);
      var uri = url.parse(matches[2]);
      var pathname = uri.pathname;
      var some = options.loadPaths.some(function (loadPath) {
        uri.pathname = path.normalize('/' + loadPath + pathname);
        return fs.existsSync(options.basePath + uri.pathname);
      });
      if (!some) throw new Error;
      decl.value = 'url(' + matches[1] + url.format(uri) + matches[3] + ')';
    });
  };
};
