var postcss = require('postcss');

var mapFunctions = require('./lib/mapFunctions');
var parseBytes = require('./lib/parseBytes');
var unescapeCss = require('./lib/unescapeCss');

var fs = require('fs');
var path = require('path');
var url = require('url');

var base64 = require('js-base64').Base64;
var cssesc = require('cssesc');
var mime = require('mime');
var sizeOf = require('image-size');

const R_SLASH = /%5C/gi;
const R_SPACE = /([0-9a-f]{1,6})%20/gi;
const R_URL = /^([^\?#]+)(.*)/;

module.exports = function (options) {

  options = options || {};
  options.baseUrl = options.baseUrl || '/';

  if (options.basePath) {
    options.basePath = path.resolve(options.basePath);
  } else {
    options.basePath = process.cwd();
  }

  if (options.loadPaths) {
    options.loadPaths = options.loadPaths.map(function (loadPath) {
      return path.resolve(options.basePath, loadPath);
    });
  } else {
    options.loadPaths = [];
  }
  options.loadPaths.unshift(options.basePath);

  if (options.relativeTo) {
    options.relativeTo = path.resolve(options.relativeTo);
  } else {
    options.relativeTo = false;
  }

  function matchLoadPath(assetPath) {
    var matchingPath;
    var isFound = options.loadPaths.some(function (loadPath) {
      matchingPath = loadPath;
      return fs.existsSync(path.join(loadPath, assetPath));
    });
    if (!isFound) throw new Error("Asset not found or unreadable: " + assetPath);
    return matchingPath;
  }

  function resolveDataUrl(assetStr) {
    var resolvedPath = resolvePath(assetStr);
    var mimeType = mime.lookup(resolvedPath);
    var data = base64.encode(fs.readFileSync(resolvedPath));
    return 'data:' + mimeType + ';base64,' + data;
  }

  function resolvePath(assetStr) {
    var chunks = splitPathFromQuery(assetStr);
    var assetPath = unescapeCss(chunks[0]);
    return path.resolve(matchLoadPath(assetPath), assetPath);
  }

  function resolveUrl(assetStr) {
    var assetUrl = url.parse(unescapeCss(assetStr));
    var assetPath = decodeURI(assetUrl.pathname);
    if (options.relativeTo) {
      var toLoadPath = path.relative(options.relativeTo, matchLoadPath(assetPath));
      toLoadPath = path.join(toLoadPath, '/');
      assetUrl.pathname = url.resolve(toLoadPath, assetPath);
    } else {
      var baseToLoadPath = path.relative(options.basePath, matchLoadPath(assetPath));
      baseToLoadPath = path.join(baseToLoadPath || '.', '/');
      var baseUrl = url.resolve(options.baseUrl, baseToLoadPath);
      assetUrl.pathname = url.resolve(baseUrl, assetPath);
    }
    return cssesc(url.format(assetUrl));
  }

  function shouldBeInline(assetPath) {
    if (options.inline && options.inline.maxSize) {
      var size = fs.statSync(assetPath).size;
      return (size <= parseBytes(options.inline.maxSize));
    }
    return false;
  }

  function splitPathFromQuery(assetStr) {
    return Array.prototype.slice.call(assetStr.match(R_URL), 1, 3);
  }

  return function (cssTree) {
    cssTree.eachDecl(function (decl) {

      decl.value = mapFunctions(decl.value, function (before, quote, assetStr, modifier, after) {

        if (modifier === 'width') {
          return sizeOf(resolvePath(assetStr)).width + 'px';
        } else if (modifier === 'height') {
          return sizeOf(resolvePath(assetStr)).height + 'px';
        }
        var assetPath = resolvePath(assetStr);
        if (shouldBeInline(assetPath)) {
          return 'url(' + before + quote + resolveDataUrl(assetStr) + quote + after + ')';
        }
        return 'url(' + before + quote + resolveUrl(assetStr) + quote + after + ')';
      });
    });
  };
};
