/* eslint quotes: 0 */

var fs = require('fs');
var path = require('path');
var plugin = require('..');
var postcss = require('postcss');
var test = require('ava');

function process(css, options, postcssOptions) {
  return postcss().use(plugin(options)).process(css, postcssOptions);
}

test('resolves urls', function (t) {
  return process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes',
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png') }");
    });
});

test('resolves urls from the current path', function (t) {
  return process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes'
  }, {
    from: path.resolve('fixtures/images/style.css')
  })
    .then(function (result) {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png') }");
    });
});

test('resolves relative urls from the current path', function (t) {
  return process("a { b: resolve('fonts/empty-sans.woff') }", {
    basePath: 'fixtures',
    relative: true
  }, {
    from: path.resolve('fixtures/images/style.css')
  })
    .then(function (result) {
      t.is(result.css, "a { b: url('../fonts/empty-sans.woff') }");
    });
});

test('busts cache when resolving urls', function (t) {
  return process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes',
    cachebuster: function (resolvedPath) {
      return fs.statSync(resolvedPath).size;
    },
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png?3061') }");
    });
});

test('throws when trying to resolve a non-existing file', function (t) {
  return process("a { b: resolve('non-existing.gif') }")
    .then(t.fail, function (err) {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    });
});

test('inlines data', function (t) {
  return process("a { b: inline('picture.png') }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css.slice(0, 32), "a { b: url('data:image/png;base6");
      t.is(result.css.slice(-32), "ufaJraBKlQAAAABJRU5ErkJggg==') }");
    });
});

test('inlines svg unencoded', function (t) {
  return process("a { b: inline('vector.svg') }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css.slice(0, 32), "a { b: url('data:image/svg+xml;c");
      t.is(result.css.slice(-32), "z%22%2F%3E%0D%0A%3C%2Fsvg%3E') }");
    });
});

test('throws when trying to inline a non-existing file', function (t) {
  return process("a { b: inline('non-existing.gif') }")
    .then(t.fail, function (err) {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    });
});

test('measures images', function (t) {
  return process("a { b: size('vector.svg'); c: width('picture.png'); d: height('picture.png') }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css, "a { b: 160px 120px; c: 200px; d: 57px }");
    });
});

test('measures images with density provided', function (t) {
  return process("a { b: size('vector.svg', 2); c: width('picture.png', 2); d: height('picture.png', 2) }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images']
  })
    .then(function (result) {
      t.is(result.css, "a { b: 80px 60px; c: 100px; d: 28.5px }");
    });
});

test('throws when trying to measure a non-existing image', function (t) {
  return process("a { b: size('non-existing.gif') }")
    .then(t.fail, function (err) {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    });
});

test('throws when trying to measure an unsupported file', function (t) {
  return process("a { b: size('fixtures/fonts/empty-sans.woff') }")
    .then(t.fail, function (err) {
      t.ok(err instanceof Error);
      t.is(err.message, 'File type not supported: ' + path.resolve('fixtures/fonts/empty-sans.woff'));
    });
});

test('throws when trying to measure an invalid file', function (t) {
  return process("a { b: size('fixtures/images/invalid.jpg') }")
    .then(t.fail, function (err) {
      t.ok(err instanceof Error);
      t.is(err.message, 'Invalid JPEG file: ' + path.resolve('fixtures/images/invalid.jpg'));
    });
});

test('handles quotes and escaped characters', function (t) {
  return process("a {" +
    "b: resolve(picture.png);" +
    "c: resolve('picture.png');" +
    'd: resolve("picture.png");' +
    'e: resolve("\\70 icture.png");' +
  "}", {
    basePath: 'fixtures/images'
  })
    .then(function (result) {
      t.is(result.css, "a {" +
        "b: url('/picture.png');" +
        "c: url('/picture.png');" +
        "d: url('/picture.png');" +
        "e: url('/picture.png');" +
      "}");
    });
});
