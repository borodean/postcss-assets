var Assets = require('assets');
var functions = require('postcss-functions');
var path = require('path');
var postcss = require('postcss');
var quote = require('./lib/quote');
var unescapeCss = require('./lib/unescape-css');
var unquote = require('./lib/unquote');
var util = require('util');

module.exports = postcss.plugin('postcss-assets', function (options) {
  options = options || {};

  if (options.relative === undefined) {
    options.relative = false;
  }

  var resolver = Assets(options);

  function measure(path, density) {
    return resolver.size(path)
      .then(function (size) {
        if (density !== undefined) {
          size.width = Number((size.width / density).toFixed(4));
          size.height = Number((size.height / density).toFixed(4));
        }
        return size;
      });
  }

  return postcss()
    .use(function (css) {
      if (css.source.input.file) {
        var inputDir = path.dirname(css.source.input.file);

        resolver.options.loadPaths = resolver.options.loadPaths || [];
        resolver.options.loadPaths.unshift(inputDir);

        if (options.relative) {
          resolver.options.relativeTo = inputDir;
        }
      }
    })
    .use(functions({
      functions: {
        resolve: function (path) {
          path = unquote(unescapeCss(path));
          return resolver.url(path)
            .then(function (url) {
              return util.format('url(%s)', quote(url));
            });
        },
        inline: function (path) {
          path = unquote(unescapeCss(path));
          return resolver.data(path)
            .then(function (data) {
              return util.format('url(%s)', quote(data));
            });
        },
        size: function (path, density) {
          path = unquote(unescapeCss(path));
          return measure(path, density)
            .then(function (size) {
              return util.format('%dpx %dpx', size.width, size.height);
            });
        },
        width: function (path, density) {
          path = unquote(unescapeCss(path));
          return measure(path, density)
            .then(function (size) {
              return util.format('%dpx', size.width);
            });
        },
        height: function (path, density) {
          path = unquote(unescapeCss(path));
          return measure(path, density)
            .then(function (size) {
              return util.format('%dpx', size.height);
            });
        }
      }
    }));
});
