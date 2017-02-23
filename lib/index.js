var Assets = require('assets');
var p = require('path');
var dirname = p.dirname;
var functions = require('postcss-functions');
var postcss = require('postcss');
var quote = require('./quote');
var unescapeCss = require('./unescape-css');
var unquote = require('./unquote');
var util = require('util');

function formatUrl(url) {
  return util.format('url(%s)', quote(url));
}

function formatSize(measurements) {
  return util.format('%dpx %dpx', measurements.width, measurements.height);
}

function formatWidth(measurements) {
  return util.format('%dpx', measurements.width);
}

function formatHeight(measurements) {
  return util.format('%dpx', measurements.height);
}

// Normalize css assets path, resolve to project base if start with '/'
function normalizePath(path, options) {
  var normalizedPath = unquote(unescapeCss(path));
  if (normalizedPath.charAt(0) === '/') {
    normalizedPath = p.resolve(options.basePath || '.', normalizedPath.slice(1));
  }
  return normalizedPath;
}

function plugin(options) {
  var params = options || {};
  var resolver;

  if (params.relative === undefined) {
    params.relative = false;
  }

  resolver = new Assets(options);

  function measure(path, density) {
    return resolver.size(path)
      .then(function correctDensity(size) {
        if (density !== undefined) {
          return {
            width: Number((size.width / density).toFixed(4)),
            height: Number((size.height / density).toFixed(4))
          };
        }
        return size;
      });
  }

  function resolveUrl(path) {
    return resolver.url(normalizePath(path, resolver.options)).then(formatUrl);
  }

  return postcss()
    .use(function appendInputDir(css) {
      var inputDir;

      if (css.source.input.file) {
        inputDir = dirname(css.source.input.file);

        resolver.options.loadPaths = resolver.options.loadPaths || [];
        resolver.options.loadPaths.unshift(inputDir);

        if (params.relative === true) {
          resolver.options.relativeTo = inputDir;
        }
      }

      if (typeof params.relative === 'string') {
        resolver.options.relativeTo = params.relative;
      }
    })
    .use(functions({
      functions: {
        url: resolveUrl,
        resolve: resolveUrl,
        inline: function inline(path) {
          var normalizedPath = normalizePath(path, resolver.options);
          return resolver.data(normalizedPath).then(formatUrl);
        },
        size: function size(path, density) {
          var normalizedPath = normalizePath(path, resolver.options);
          return measure(normalizedPath, density).then(formatSize);
        },
        width: function width(path, density) {
          var normalizedPath = normalizePath(path, resolver.options);
          return measure(normalizedPath, density).then(formatWidth);
        },
        height: function height(path, density) {
          var normalizedPath = normalizePath(path, resolver.options);
          return measure(normalizedPath, density).then(formatHeight);
        }
      }
    }));
}

module.exports = postcss.plugin('postcss-assets', plugin);
