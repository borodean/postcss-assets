const Assets = require('assets');
const { dirname } = require('path');
const functions = require('postcss-functions');
const util = require('util');
const quote = require('./quote');
const unescapeCss = require('./unescape-css');
const unquote = require('./unquote');
const generateFileUniqueId = require('./__utils__/generateFileUniqueId');

const cachedDimensions = {};

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

module.exports = (params = {}) => {
  if (params.relative === undefined) {
    params.relative = false; // eslint-disable-line no-param-reassign
  }

  const resolver = new Assets(params);

  function measure(path, density) {
    let cached = null;
    let id = '';
    let getSizePromise = null;

    return resolver.path(path).then((resolvedPath) => {
      if (params.cache) {
        cached = cachedDimensions[resolvedPath];
        id = generateFileUniqueId(resolvedPath);
      }

      if (cached && id && cached[id]) {
        getSizePromise = Promise.resolve(cached[id]);
      } else {
        getSizePromise = resolver.size(path).then((size) => {
          if (params.cache && id) {
            cachedDimensions[resolvedPath] = {};
            cachedDimensions[resolvedPath][id] = size;
          }
          return size;
        });
      }

      return getSizePromise.then((size) => {
        if (density !== undefined) {
          return {
            width: Number((size.width / density).toFixed(4)),
            height: Number((size.height / density).toFixed(4)),
          };
        }
        return size;
      });
    });
  }

  return {
    // Initialize functions plugin as if it was this plugin
    ...functions({
      functions: {
        resolve: function resolve(path) {
          const normalizedPath = unquote(unescapeCss(path));
          return resolver.url(normalizedPath).then(formatUrl);
        },
        inline: function inline(path) {
          const normalizedPath = unquote(unescapeCss(path));
          return resolver.data(normalizedPath).then(formatUrl);
        },
        size: function size(path, density) {
          const normalizedPath = unquote(unescapeCss(path));
          return measure(normalizedPath, density).then(formatSize);
        },
        width: function width(path, density) {
          const normalizedPath = unquote(unescapeCss(path));
          return measure(normalizedPath, density).then(formatWidth);
        },
        height: function height(path, density) {
          const normalizedPath = unquote(unescapeCss(path));
          return measure(normalizedPath, density).then(formatHeight);
        },
      },
    }),
    // Override with our own features and name
    postcssPlugin: 'postcss-assets',
    Once(root) {
      let inputDir;
      if (root.source.input.file) {
        inputDir = dirname(root.source.input.file);

        resolver.options.loadPaths = resolver.options.loadPaths || [];
        resolver.options.loadPaths.unshift(inputDir);

        if (params.relative === true) {
          resolver.options.relativeTo = inputDir;
        }
      }

      if (typeof params.relative === 'string') {
        resolver.options.relativeTo = params.relative;
      }
    },
  };
};

module.exports.postcss = true;
