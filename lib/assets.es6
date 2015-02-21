import vendor from 'postcss/lib/vendor';

import mapFunctions from './mapFunctions';
import unescapeCss from './unescapeCss';

import fs from 'fs';
import path from 'path';
import url from 'url';

import cssesc from 'cssesc';
import mime from 'mime';
import sizeOf from 'image-size';

class Assets {
  constructor(options = {}) {
    this.options = options;
    this.options.baseUrl = this.options.baseUrl || '/';
    if (this.options.basePath) {
      this.options.basePath = path.resolve(this.options.basePath);
    } else {
      this.options.basePath = process.cwd();
    }
    if (this.options.loadPaths) {
      this.options.loadPaths = this.options.loadPaths.map((loadPath) => {
        return path.resolve(this.options.basePath, loadPath);
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
  }

  getImageSize(assetStr, density) {
    var assetPath, err, size;
    assetPath = this.resolvePath(assetStr.value);
    try {
      size = sizeOf(assetPath);
      if (typeof density !== 'undefined') {
        density = parseFloat(density.value, 10);
        size.width  = +(size.width  / density).toFixed(4);
        size.height = +(size.height / density).toFixed(4);
      }
      return size;
    } catch (exception) {
      err = new Error("Image corrupted: " + assetPath);
      err.name = 'ECORRUPT';
      throw err;
    }
  }

  matchPath(assetPath) {
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
      exception = new Error("Asset not found or unreadable: " + assetPath);
      exception.name = 'ENOENT';
      throw exception;
    }
    return matchingPath;
  }

  resolveDataUrl(assetStr) {
    var data, encoding, mimeType, resolvedPath;
    resolvedPath = this.resolvePath(assetStr);
    mimeType = mime.lookup(resolvedPath);
    if (mimeType === 'image/svg+xml') {
      data = cssesc(fs.readFileSync(resolvedPath).toString());
      encoding = 'utf8';
    } else {
      data = new Buffer(fs.readFileSync(resolvedPath), 'binary').toString('base64');
      encoding = 'base64';
    }
    return 'data:' + mimeType + ';' + encoding + ',' + data;
  }

  resolvePath(assetStr) {
    var assetUrl = url.parse(unescapeCss(assetStr));
    var assetPath = decodeURI(assetUrl.pathname);
    return this.matchPath(assetPath);
  }

  resolveUrl(assetStr) {
    var assetPath, assetUrl, baseToAsset;
    assetUrl = url.parse(unescapeCss(assetStr));
    assetPath = decodeURI(assetUrl.pathname);
    if (this.options.relativeTo) {
      assetUrl.pathname = path.relative(this.options.relativeTo, this.matchPath(assetPath));
    } else {
      baseToAsset = path.relative(this.options.basePath, this.matchPath(assetPath));
      assetUrl.pathname = url.resolve(this.options.baseUrl, baseToAsset);
    }
    if (this.options.cachebuster) {
      if (assetUrl.search) {
        assetUrl.search = assetUrl.search + '&';
      } else {
        assetUrl.search = '?';
      }
      assetUrl.search += this.options.cachebuster(this.resolvePath(assetPath));
    }
    return cssesc(url.format(assetUrl));
  }

  postcss (cssTree) {
    cssTree.eachDecl((decl) => {
      this.inputPath = decl.source.input.file;
      try {
        decl.value = mapFunctions(decl.value, {
          resolve: (assetStr) => {
            assetStr.value = this.resolveUrl(assetStr.value);
            return 'url(' + assetStr + ')';
          },
          inline: (assetStr) => {
            assetStr.value = this.resolveDataUrl(assetStr.value);
            return 'url(' + assetStr + ')';
          },
          width: (assetStr, density) => {
            return this.getImageSize(assetStr, density).width  + 'px';
          },
          height: (assetStr, density) => {
            return this.getImageSize(assetStr, density).height + 'px';
          },
          size: (assetStr, density) => {
            var size = this.getImageSize(assetStr, density);
            return size.width + 'px ' + size.height + 'px';
          }
        });
      } catch (exception) {
        switch (exception.name) {
        case 'ECORRUPT':
          throw decl.error(exception.message);
        case 'ENOENT':
          throw decl.error(exception.message + '\nLoad paths:\n  ' + this.options.loadPaths.join('\n  '));
        default:
          throw exception;
        }
      }
    });
  };
}

var assets = function (options) {
  return new Assets(options);
};

assets.postcss = function (cssTree) {
  assets().postcss(cssTree);
};

export default assets;
