var postcss = require('postcss');

var parseBytes = require('./lib/parseBytes');
var unescapeCss = require('./lib/unescapeCss');

var fs = require('fs');
var path = require('path');
var url = require('url');

var base64 = require('js-base64').Base64;
var mime = require('mime');
var sizeOf = require('image-size');

const R_FUNC = /^(asset(?:-url|-inline|-width|-height)?)\((\s*['"]?)(.*?)(['"]?\s*)\)$/
const R_SLASH = /%5C/gi;
const R_SPACE = /([0-9a-f]{1,6})%20/gi;
const R_URL = /^([^\?#]+)(.*)/;

module.exports = function (options) {

  options = options || {};

  if (options.basePath) {
    options.basePath = path.resolve(options.basePath);
  } else {
    options.basePath = process.cwd();
  }

  options.baseUrl = options.baseUrl || '/';

  options.loadPaths = options.loadPaths || [];
  options.loadPaths.unshift('.');

  function matchLoadPath(assetPath) {
    var matchingPath;
    var isFound = options.loadPaths.some(function (loadPath) {
      matchingPath = path.join(loadPath, '/');
      return fs.existsSync(path.join(options.basePath, matchingPath, assetPath));
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
    return path.join(options.basePath, matchLoadPath(assetPath), assetPath);
  }

  function resolveUrl(assetStr) {
    var chunks = splitPathFromQuery(assetStr);
    var assetPath = unescapeCss(chunks[0]);
    var baseUrl = url.resolve(options.baseUrl, matchLoadPath(assetPath));
    chunks[0] = encodeURI(baseUrl + chunks[0]).replace(R_SLASH, '\\').replace(R_SPACE, '$1 ');
    return chunks.join('');
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

      var matches = decl.value.match(R_FUNC);
      if (!matches) return;

      var method = matches[1];
      var contentBefore = matches[2];
      var assetStr = matches[3];
      var contentAfter = matches[4];

      switch (method) {
      case 'asset':
        var assetPath = resolvePath(assetStr);
        if (shouldBeInline(assetPath)) {
          decl.value = 'url(' + contentBefore + resolveDataUrl(assetStr) + contentAfter + ')';
        } else {
          decl.value = 'url(' + contentBefore + resolveUrl(assetStr) + contentAfter + ')';
        }
        break;
      case 'asset-url':
        decl.value = 'url(' + contentBefore + resolveUrl(assetStr) + contentAfter + ')';
        break;
      case 'asset-inline':
        decl.value = 'url(' + contentBefore + resolveDataUrl(assetStr) + contentAfter + ')';
        break;
      case 'asset-width':
        decl.value = sizeOf(resolvePath(assetStr)).width + 'px';
        break;
      case 'asset-height':
        decl.value = sizeOf(resolvePath(assetStr)).height + 'px';
        break;
      }
    });
  };
};
