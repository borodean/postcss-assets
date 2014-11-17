PostCSS Assets
==============

PostCSS Assets is an asset manager for CSS. It isolates stylesheets from environmental changes, gets image sizes and inlines files.

Table of contents
-----------------

* [Installation](#installation)
* [Usage](#usage)
* [URL resolution](#url-resolution)
  * [Load paths](#load-paths)
  * [Base path](#base-path)
  * [Base URL](#base-url)
  * [Relative paths](#relative-paths)
* [Image dimensions](#image-dimensions)
* [Inlining files](#inlining-files)
* [Full list of options](#full-list-of-options)
* [Full list of modifiers](#full-list-of-modifiers)

Installation
------------

```bash
npm install postcss-assets --save-dev
```

Usage
-----

### [Gulp PostCSS](https://github.com/w0rm/gulp-postcss)

```js
gulp.task('assets', function () {
  var postcss = require('postcss');
  var assets  = require('postcss-assets');

  return gulp.src('source/*.css')
    .pipe(postcss([assets({
      loadPaths: ['images/']
    })]))
    .pipe(gulp.dest('build/'));
});
```

### [Grunt PostCSS](https://github.com/nDmitry/grunt-postcss)

```js
var assets  = require('postcss-assets');

grunt.initConfig({
  postcss: {
    options: {
      processors: [
        assets({
          loadPaths: ['images/']
        }).postcss
      ]
    },
    dist: { src: 'build/*.css' }
  },
});
```

URL resolution
--------------

These options isolate stylesheets from environmental changes.

### Load paths

To make Assets search for files in specific directories, define load paths:

```js
var options = {
  loadPaths: ['fonts/', 'media/patterns/', '/images/']
};
```

Example:

```css
body {
  background: url('foobar.jpg');
  background: url('icons/baz.png');
}
```

PostCSS Assets would look for the files in load paths, then in the base path. If it succeed, it would resolve a true URL:

```css
body {
  background: url('/media/patterns/foobar.jpg');
  background: url('/images/icons/baz.png');
}
```

### Base path

If the root directory of your site is not where you execute PostCSS Assets, correct it:
```js
var options = {
  basePath: 'source/'
};
```

PostCSS Assets would treat `source` directory as `/` for all URLs and load paths would be relative to it.

### Base URL

If the URL of your base path is not `/`, correct it:
```js
var options = {
  baseUrl: 'http://example.com/wp-content/themes/'
};
```

### Relative paths

To make resolved paths relative, define a directory to relate to:
```js
var options = {
  relativeTo: 'assets/css'
};
```

Image dimensions
----------------

Image width or height are automatically calculated, if a dimensional property has an ```url(...)``` value:

```css
body {
  width: url('images/foobar.png'); /* 320px */
  height: url('images/foobar.png'); /* 240px */
  background-size: url('images/foobar.png'); /* 320px 240px */
}
```

This would happen for every property with a clear orientation:

```css
body {
  left: url('images/foobar.png'); /* 320px */
  border-top: url('images/foobar.png') solid #000; /* 240px solid #000 */
  margin: url('images/foobar.png'); /* 320px 240px */
}
```

To override the orientation, set a modifier:

```css
body {
  width: url('images/foobar.png' height); /* 240px */
  height: url('images/foobar.png' width); /* 320px */
}
```

Inlining files
--------------

```js
var options = {
  inline: {
    maxSize: '52K'
  }
};
```

This would make all the files smaller than 52 kilobytes be inlined to a stylesheet in Base64 encoding. SVG files would be inlined unencoded, because [then they benefit in size](http://css-tricks.com/probably-dont-base64-svg/).

Full list of options
--------------------

| Option           | Description                                                                     | Default |
|:-----------------|:--------------------------------------------------------------------------------|:--------|
| `basePath`       | Root directory of the project.                                                  | `.`     |
| `baseUrl`        | URL of the project when running the web server.                                 | `/`     |
| `loadPaths`      | Specific directories to look for the files.                                     | `[]`    |
| `relativeTo`     | Directory to relate to when resolving URLs. If `false`, disables relative URLs. | `false` |
| `inline.maxSize` | Maximum size of files to inline to CSS. If undefined, disables the inlining.    |         |

Full list of modifiers
----------------------

| Modifier | Description                                                     |
|:---------|:----------------------------------------------------------------|
| `width`  | Converts to image width.                                        |
| `height` | Converts to image height.                                       |
| `size`   | Converts to both image width and height separated with a space. |
