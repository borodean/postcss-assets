// Native imports
var fs = require('fs');
var path = require('path');
var url = require('url');

// Vendor imports
var cssesc = require('cssesc');
var mime = require('mime');
var sizeOf = require('image-size');
var SVGEncoder = require('directory-encoder/lib/svg-uri-encoder.js');

// Local imports
var mapFunctions = require('./lib/map-functions');
var unescapeCss = require('./lib/unescape-css');

var Assets = function (options) {
  var self = this;
  this.options = options || {};
  this.options.baseUrl = this.options.baseUrl || '/';
  if (this.options.basePath) {
    this.options.basePath = path.resolve(this.options.basePath);
  } else {
    this.options.basePath = process.cwd();
  }
  if (this.options.loadPaths) {
    this.options.loadPaths = this.options.loadPaths.map(function (loadPath) {
      return path.resolve(self.options.basePath, loadPath);
    });
  } else {
    this.options.loadPaths = [];
  }
  this.options.loadPaths.unshift(this.options.basePath);
  if (this.options.relativeTo) {
    this.options.relativeTo = path.resolve(this.options.relativeTo);
  } else {
    this.options.relativeTo = false;
  }
  if (this.options.cachebuster === true) {
    this.options.cachebuster = function (path) {
      var mtime = fs.statSync(path).mtime;
      return mtime.getTime().toString(16);
    };
  }
  this.postcss = this.postcss.bind(this);
};

Assets.prototype.getImageSize = function (assetStr, density) {
  var assetPath, err, size;
  assetPath = this.resolvePath(assetStr.value);
  try {
    size = sizeOf(assetPath);
    if (typeof density !== 'undefined') {
      density = parseFloat(density.value, 10);
      size.width  = Number((size.width  / density).toFixed(4));
      size.height = Number((size.height / density).toFixed(4));
    }
    return size;
  } catch (exception) {
    err = new Error('Image corrupted: ' + assetPath);
    err.name = 'ECORRUPT';
    throw err;
  }
};

Assets.prototype.matchPath = function (assetPath) {
  var exception, isFound, loadPaths, matchingPath;
  if (typeof this.inputPath === 'string') {
    loadPaths = [path.dirname(this.inputPath)].concat(this.options.loadPaths);
  } else {
    loadPaths = this.options.loadPaths;
  }
  isFound = loadPaths.some(function (loadPath) {
    matchingPath = path.join(loadPath, assetPath);
    return fs.existsSync(matchingPath);
  });
  if (!isFound) {
    exception = new Error('Asset not found or unreadable: ' + assetPath);
    exception.name = 'ENOENT';
    throw exception;
  }
  return matchingPath;
};

Assets.prototype.resolveDataUrl = function (assetStr) {
  var data, mimeType, resolvedPath;
  resolvedPath = this.resolvePath(assetStr);
  mimeType = mime.lookup(resolvedPath);
  if (mimeType === 'image/svg+xml') {
    return (new SVGEncoder(resolvedPath)).encode();
  }
  data = new Buffer(fs.readFileSync(resolvedPath), 'binary').toString('base64');
  return 'data:' + mimeType + ';base64,' + data;
};

Assets.prototype.resolvePath = function (assetStr) {
  var assetUrl = url.parse(unescapeCss(assetStr));
  var assetPath = decodeURI(assetUrl.pathname);
  return this.matchPath(assetPath);
};

Assets.prototype.resolveUrl = function (assetStr) {
  var assetPath, assetUrl, baseToAsset, cachebusterOutput;
  assetUrl = url.parse(unescapeCss(assetStr));
  assetPath = decodeURI(assetUrl.pathname);
  if (this.options.relativeTo) {
    assetUrl.pathname = path.relative(this.options.relativeTo, this.matchPath(assetPath));
  } else {
    baseToAsset = path.relative(this.options.basePath, this.matchPath(assetPath));
    assetUrl.pathname = url.resolve(this.options.baseUrl, baseToAsset);
  }
  if (this.options.cachebuster) {
    cachebusterOutput = this.options.cachebuster(this.resolvePath(assetPath), assetUrl.pathname);
    if (cachebusterOutput) {
      if (typeof cachebusterOutput === 'string') {
        if (assetUrl.search) {
          assetUrl.search = assetUrl.search + '&' + cachebusterOutput;
        } else {
          assetUrl.search = '?' + cachebusterOutput;
        }
      }
      if (cachebusterOutput.pathname) {
        assetUrl.pathname = cachebusterOutput.pathname;
      }
      if (cachebusterOutput.query) {
        if (assetUrl.search) {
          assetUrl.search = assetUrl.search + '&' + cachebusterOutput.query;
        } else {
          assetUrl.search = '?' + cachebusterOutput.query;
        }
      }
    }
  }
  return cssesc(url.format(assetUrl));
};

Assets.prototype.postcss = function (cssTree) {
  var self = this;
  cssTree.eachDecl(function (decl) {
    self.inputPath = decl.source.input.file;
    try {
      decl.value = mapFunctions(decl.value, {
        resolve: function (assetStr) {
          assetStr.value = self.resolveUrl(assetStr.value);
          return 'url(' + assetStr + ')';
        },
        inline: function (assetStr) {
          assetStr.value = self.resolveDataUrl(assetStr.value);
          return 'url(' + assetStr + ')';
        },
        width: function (assetStr, density) {
          return self.getImageSize(assetStr, density).width  + 'px';
        },
        height: function (assetStr, density) {
          return self.getImageSize(assetStr, density).height + 'px';
        },
        size: function (assetStr, density) {
          var size = self.getImageSize(assetStr, density);
          return size.width + 'px ' + size.height + 'px';
        }
      });
    } catch (exception) {
      switch (exception.name) {
      case 'ECORRUPT':
        throw decl.error(exception.message);
      case 'ENOENT':
        throw decl.error(exception.message + '\nLoad paths:\n  ' + self.options.loadPaths.join('\n  '));
      default:
        throw exception;
      }
    }
  });
};

var assets = function (options) {
  return new Assets(options);
};

assets.postcss = function (cssTree) {
  assets().postcss(cssTree);
};

module.exports = assets;
