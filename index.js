var Assets = require('assets');
var dirname = require('path').dirname;
var functions = require('postcss-functions');
var postcss = require('postcss');
var quote = require('./lib/quote');
var unescapeCss = require('./lib/unescape-css');
var unquote = require('./lib/unquote');
var util = require('util');

function formatUrl(url) {
  return util.format('url(%s)', quote(url));
}

function formatSize(unit, measurements) {
  return util.format('%d' + unit + ' %d' + unit, measurements.width, measurements.height);
}

function formatWidth(unit, measurements) {
  return util.format('%d' + unit, measurements.width);
}

function formatHeight(unit, measurements) {
  return util.format('%d' + unit, measurements.height);
}

function plugin(options) {
  var params = options || {};
  var resolver;

  if (params.relative === undefined) {
    params.relative = false;
  }

  resolver = new Assets(options);

  function measure(path, density, unitBase) {
    return resolver.size(path)
      .then(function correctDensity(size) {
        if (density !== undefined) {
          return {
            width: Number(size.width / density),
            height: Number(size.height / density)
          };
        }
        return size;
      })
      .then(function correctUnitBase(size) {
        if (unitBase !== undefined) {
          return {
            width: Number(size.width / unitBase),
            height: Number(size.height / unitBase)
          };
        }
        return size;
      })
      .then(function round(size) {
        return {
          width: size.width.toFixed(4),
          height: size.height.toFixed(4)
        };
      });
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
        resolve: function resolve(path) {
          var normalizedPath = unquote(unescapeCss(path));
          return resolver.url(normalizedPath).then(formatUrl);
        },
        inline: function inline(path) {
          var normalizedPath = unquote(unescapeCss(path));
          return resolver.data(normalizedPath).then(formatUrl);
        },
        size: function size(path, density, unit, unitBase) {
          var normalizedPath = unquote(unescapeCss(path));
          var normalizedUnit = unquote(unescapeCss(unit || 'px'));
          return measure(normalizedPath, density, unitBase)
            .then(formatSize.bind(null, normalizedUnit));
        },
        width: function width(path, density, unit, unitBase) {
          var normalizedPath = unquote(unescapeCss(path));
          var normalizedUnit = unquote(unescapeCss(unit || 'px'));
          return measure(normalizedPath, density, unitBase)
            .then(formatWidth.bind(null, normalizedUnit));
        },
        height: function height(path, density, unit, unitBase) {
          var normalizedPath = unquote(unescapeCss(path));
          var normalizedUnit = unquote(unescapeCss(unit || 'px'));
          return measure(normalizedPath, density, unitBase)
            .then(formatHeight.bind(null, normalizedUnit));
        }
      }
    }));
}

module.exports = postcss.plugin('postcss-assets', plugin);
