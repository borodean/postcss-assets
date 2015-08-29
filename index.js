// Native imports
var fs = require('fs');
var path = require('canonical-path');
var url = require('url');

// Vendor imports
var cssesc = require('cssesc');
var mime = require('mime');
var postcss = require('postcss');
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
    // Convert the provided base path to an absolute form
    this.options.basePath = path.resolve(this.options.basePath);
  } else {
    // Set to an absolute path to the working directory
    this.options.basePath = process.cwd();
  }

  if (this.options.loadPaths) {
    // Convert each of the load paths to an absolute form built from the base path
    this.options.loadPaths = this.options.loadPaths.map(function (loadPath) {
      return path.resolve(self.options.basePath, loadPath);
    });
  } else {
    // Set to an empty array
    this.options.loadPaths = [];
  }

  // The first path to look for should be the base path
  this.options.loadPaths.unshift(this.options.basePath);

  if (this.options.relativeTo) {
    // Convert the provided relativeTo path to an absolute form
    this.options.relativeTo = path.resolve(this.options.relativeTo);
  } else {
    // Disable relative resolution
    this.options.relativeTo = false;
  }

  if (this.options.cachebuster === true) {
    // Set to a default cachebuster method
    this.options.cachebuster = function (path) {
      var mtime = fs.statSync(path).mtime;
      return mtime.getTime().toString(16);
    };
  }

  // Bind `this` to an Asset instance
  this.postcss = this.postcss.bind(this);
};

Assets.prototype.getImageSize = function (assetStr, density) {
  var assetPath, err, size;

  // Find out where an asset really is
  assetPath = this.resolvePath(assetStr.value);

  try {
    // Get asset dimensions
    size = sizeOf(assetPath);
  } catch (exception) {
    // If sizeOf throws an exception we throw a new one
    // for our error handler
    err = new Error('Image corrupted: ' + assetPath);
    err.name = 'ECORRUPT';
    throw err;
  }

  // If density is provided then correct the dimensions to conform it
  if (density !== undefined) {
    density = parseFloat(density.value, 10);
    size.width  = Number((size.width  / density).toFixed(4));
    size.height = Number((size.height / density).toFixed(4));
  }

  return size;
};

Assets.prototype.matchPath = function (assetPath) {
  var exception, isFound, loadPaths, matchingPath;

  // If inputPath was provided then prepend it to the list of load paths,
  // otherwise leave them as they were
  if (typeof this.inputPath === 'string') {
    loadPaths = [path.dirname(this.inputPath)].concat(this.options.loadPaths);
  } else {
    loadPaths = this.options.loadPaths;
  }

  // Sequentially append asset path to each of the load paths,
  // testing the resulting path for existenсe.
  isFound = loadPaths.some(function (loadPath) {
    matchingPath = path.join(loadPath, assetPath);
    return fs.existsSync(matchingPath);
  });

  // If none of the tests for existence succeeded, throw an exception
  if (!isFound) {
    exception = new Error('Asset not found or unreadable: ' + assetPath);
    exception.name = 'ENOENT';
    throw exception;
  }

  return matchingPath;
};

Assets.prototype.resolveDataUrl = function (assetStr) {
  var data, mimeType, resolvedPath;

  // Find out where an asset really is
  resolvedPath = this.resolvePath(assetStr);

  // Look up for its MIME type
  mimeType = mime.lookup(resolvedPath);

  // If its an SVG then don't base64-encode it - text formats
  // are smaller when output as is
  if (mimeType === 'image/svg+xml') {
    return (new SVGEncoder(resolvedPath)).encode();
  }

  // Base64-encode assets' content
  data = new Buffer(fs.readFileSync(resolvedPath), 'binary').toString('base64');

  // Return data-uri formatted string containing encoded data
  return 'data:' + mimeType + ';base64,' + data;
};

Assets.prototype.resolvePath = function (assetStr) {

  // Extract the pathname portion of the asset string provided
  var assetUrl = url.parse(unescapeCss(assetStr));
  var assetPath = decodeURI(assetUrl.pathname);

  return this.matchPath(assetPath);
};

Assets.prototype.resolveUrl = function (assetStr) {
  var assetPath, assetUrl, baseToAsset, cachebusterOutput;

  // Store the portions of the asset string provided
  assetUrl = url.parse(unescapeCss(assetStr));

  // Extract the pathname portion
  assetPath = decodeURI(assetUrl.pathname);

  if (this.options.relativeTo) {

    // Build a relative pathname from the relative point to the matching path
    assetUrl.pathname = path.relative(this.options.relativeTo, this.matchPath(assetPath));

  } else {

    // Build a relative path from the server root to the matching path
    baseToAsset = path.relative(this.options.basePath, this.matchPath(assetPath));

    // Resolve that relative path from the server URL
    assetUrl.pathname = url.resolve(this.options.baseUrl, baseToAsset);
  }

  if (this.options.cachebuster) {
    // Process resolved path and URL through cachebuster function
    cachebusterOutput = this.options.cachebuster(this.resolvePath(assetPath), assetUrl.pathname);

    if (cachebusterOutput) {

      // If its a string, append it to the query portion of the URL
      if (typeof cachebusterOutput === 'string') {

        // If it already has a query, append it with an ampersand,
        // otherwise create it starting with an question mark
        if (assetUrl.search) {
          assetUrl.search = assetUrl.search + '&' + cachebusterOutput;
        } else {
          assetUrl.search = '?' + cachebusterOutput;
        }
      }

      // If its an object having a pathname key, replace the pathname portion of the URL with it
      if (cachebusterOutput.pathname) {
        assetUrl.pathname = cachebusterOutput.pathname;
      }

      // If its an object having a query, append it to the query portion of the URL
      if (cachebusterOutput.query) {

        // If it already has a query, append it with an ampersand,
        // otherwise create it starting with an question mark
        if (assetUrl.search) {
          assetUrl.search = assetUrl.search + '&' + cachebusterOutput.query;
        } else {
          assetUrl.search = '?' + cachebusterOutput.query;
        }
      }
    }
  }

  // Escape the resulting URL to be CSS-compatible
  return cssesc(url.format(assetUrl));
};

Assets.prototype.postcss = function (css) {
  var self = this;

  // Loop through every declaration
  css.walkDecls(function (decl) {

    // Store the input file path of the file being processed
    self.inputPath = decl.source.input.file;

    try {

      // Map each function inside the value to the corresponding processor
      decl.value = mapFunctions(decl.value, {

        // Get URL to an asset file
        resolve: function (assetStr) {
          assetStr.value = self.resolveUrl(assetStr.value);
          return 'url(' + assetStr + ')';
        },

        // Get data-uri representation of an asset file content
        inline: function (assetStr) {
          assetStr.value = self.resolveDataUrl(assetStr.value);
          return 'url(' + assetStr + ')';
        },

        // Get asset width
        width: function (assetStr, density) {
          return self.getImageSize(assetStr, density).width  + 'px';
        },

        // Get asset height
        height: function (assetStr, density) {
          return self.getImageSize(assetStr, density).height + 'px';
        },

        // Get both asset dimensions separated with a space
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

module.exports = postcss.plugin('postcss-assets', function (options) {
  var assets = new Assets(options);

  return assets.postcss;
});
