/* eslint quotes: 0 */

import fs from 'fs';
import path from 'path';
import plugin from '..';
import postcss from 'postcss';
import test from 'ava';

function process(css, options, postcssOptions) {
  return postcss().use(plugin(options)).process(css, postcssOptions);
}

test('resolves urls', (t) =>
  process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes',
    loadPaths: ['fonts', 'images'],
  })
    .then((result) => {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png') }");
    }));

test('resolves urls from the current path', (t) =>
  process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes',
  }, {
    from: path.resolve('fixtures/images/style.css'),
  })
    .then((result) => {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png') }");
    }));

test('resolves relative urls from the current path', (t) =>
  process("a { b: resolve('fonts/empty-sans.woff') }", {
    basePath: 'fixtures',
    relative: true,
  }, {
    from: path.resolve('fixtures/images/style.css'),
  })
    .then((result) => {
      t.is(result.css, "a { b: url('../fonts/empty-sans.woff') }");
    }));

test('resolves relative urls from the provided path', (t) =>
  process("a { b: resolve('fonts/empty-sans.woff') }", {
    basePath: 'fixtures',
    relative: 'fonts',
  })
    .then((result) => {
      t.is(result.css, "a { b: url('empty-sans.woff') }");
    }));

test('busts cache when resolving urls', (t) =>
  process("a { b: resolve('picture.png') }", {
    basePath: 'fixtures',
    baseUrl: 'http://example.com/wp-content/themes',
    cachebuster(resolvedPath) {
      return fs.statSync(resolvedPath).size;
    },
    loadPaths: ['fonts', 'images'],
  })
    .then((result) => {
      t.is(result.css, "a { b: url('http://example.com/wp-content/themes/images/picture.png?3061') }");
    }));

test('throws when trying to resolve a non-existing file', (t) =>
  process("a { b: resolve('non-existing.gif') }")
    .then(t.fail, (err) => {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    }));

test('inlines data', (t) =>
  process("a { b: inline('picture.png') }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images'],
  })
    .then((result) => {
      t.is(result.css.slice(0, 32), "a { b: url('data:image/png;base6");
      t.is(result.css.slice(-32), "ufaJraBKlQAAAABJRU5ErkJggg==') }");
    }));

test('inlines svg unencoded', (t) =>
  process("a { b: inline('vector.svg') }", {
    basePath: 'fixtures',
    loadPaths: ['fonts', 'images'],
  })
    .then((result) => {
      t.is(result.css.slice(0, 32), "a { b: url('data:image/svg+xml;c");
      t.is(result.css.slice(-32), "z%22%2F%3E%0D%0A%3C%2Fsvg%3E') }");
    }));

test('throws when trying to inline a non-existing file', (t) =>
  process("a { b: inline('non-existing.gif') }")
    .then(t.fail, (err) => {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    }));

test('measures images', (t) =>
  process("a { " +
    "b: size('vector.svg'); " +
    "c: width('picture.png'); " +
    "d: height('picture.png'); " +
    "}", {
      basePath: 'fixtures',
      loadPaths: ['fonts', 'images'],
    })
      .then((result) => {
        t.is(result.css, "a { b: 160px 120px; c: 200px; d: 57px; }");
      }));

test('measures images with density provided', (t) =>
  process("a { " +
    "b: size('vector.svg', 2); " +
    "c: width('picture.png', 2); " +
    "d: height('picture.png', 2); " +
    "}", {
      basePath: 'fixtures',
      loadPaths: ['fonts', 'images'],
    })
      .then((result) => {
        t.is(result.css, "a { b: 80px 60px; c: 100px; d: 28.5px; }");
      }));

test('throws when trying to measure a non-existing image', (t) =>
  process("a { b: size('non-existing.gif') }")
    .then(t.fail, (err) => {
      t.ok(err instanceof Error);
      t.is(err.message, 'Asset not found or unreadable: non-existing.gif');
    }));

test('throws when trying to measure an unsupported file', (t) =>
  process("a { b: size('fixtures/fonts/empty-sans.woff') }")
    .then(t.fail, (err) => {
      const absolutePath = path.resolve('fixtures/fonts/empty-sans.woff');
      t.ok(err instanceof Error);
      t.is(err.message, `File type not supported: ${absolutePath}`);
    }));

test('throws when trying to measure an invalid file', (t) =>
  process("a { b: size('fixtures/images/invalid.jpg') }")
    .then(t.fail, (err) => {
      const absolutePath = path.resolve('fixtures/images/invalid.jpg');
      t.ok(err instanceof Error);
      t.is(err.message, `Invalid JPEG file: ${absolutePath}`);
    }));

test('handles quotes and escaped characters', (t) =>
  process("a {" +
    "b: resolve(picture.png);" +
    "c: resolve('picture.png');" +
    'd: resolve("picture.png");' +
    'e: resolve("\\70 icture.png");' +
  "}", {
    basePath: 'fixtures/images',
  })
    .then((result) => {
      t.is(result.css, "a {" +
        "b: url('/picture.png');" +
        "c: url('/picture.png');" +
        "d: url('/picture.png');" +
        "e: url('/picture.png');" +
      "}");
    }));

test('allows usage inside media queries', (t) =>
  process("@media a and (b: height('fixtures/images/picture.png')) { c { d: e }}")
    .then((result) => {
      t.is(result.css, "@media a and (b: 57px) { c { d: e }}");
    }));
