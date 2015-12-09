var AssetResolver = require('asset-resolver');
var CSSString = require('./lib/css-string');
var functions = require('postcss-functions');
var path = require('path');
var postcss = require('postcss');
var unescapeCss = require('./lib/unescape-css');
var util = require('util');

module.exports = postcss.plugin('postcss-assets', function (options) {
  var resolver = AssetResolver(options);

  function measure (path, density) {
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
        resolver.options.currentPath = path.dirname(css.source.input.file);
      }
    })
    .use(functions({
      functions: {
        resolve: function (path) {
          path = new CSSString(unescapeCss(path));
          return resolver.url(path.value)
            .then(function (url) {
              path.value = url;
              return util.format('url(%s)', path);
            });
        },
        inline: function (path) {
          path = new CSSString(unescapeCss(path));
          return resolver.data(path.value)
            .then(function (data) {
              path.value = data;
              return util.format('url(%s)', path);
            });
        },
        size: function (path, density) {
          path = new CSSString(unescapeCss(path));
          return measure(path.value, density)
            .then(function (size) {
              return util.format('%dpx %dpx', size.width, size.height);
            });
        },
        width: function (path, density) {
          path = new CSSString(unescapeCss(path));
          return measure(path.value, density)
            .then(function (size) {
              return util.format('%dpx', size.width);
            });
        },
        height: function (path, density) {
          path = new CSSString(unescapeCss(path));
          return measure(path.value, density)
            .then(function (size) {
              return util.format('%dpx', size.height);
            });
        }
      }
    }));
});
