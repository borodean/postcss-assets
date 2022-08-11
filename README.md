# ![postcss-assets](https://cdn.jsdelivr.net/gh/borodean/postcss-assets@master/media/postcss-assets.svg)

PostCSS Assets is an asset manager for CSS. It isolates stylesheets from environmental changes, gets image sizes and inlines files.

[![Unix Build Status][travis-badge]][travis] [![Windows Build Status][appveyor-badge]][appveyor] [![Coverage][coveralls-badge]][coveralls]

[appveyor]:        https://ci.appveyor.com/project/borodean/postcss-assets/branch/master
[appveyor-badge]:  https://img.shields.io/appveyor/build/borodean/postcss-assets/master?label=windows
[coveralls]:       https://coveralls.io/github/borodean/postcss-assets
[coveralls-badge]: https://img.shields.io/coveralls/github/borodean/postcss-assets/master
[travis]:          https://travis-ci.org/borodean/postcss-assets
[travis-badge]:    https://img.shields.io/travis/borodean/postcss-assets/master?label=unix

Table of contents
-----------------

* [Terms of use](#terms-of-use)
* [Installation](#installation)
* [Usage](#usage)
* [URL resolution](#url-resolution)
  * [Load paths](#load-paths)
  * [Base path](#base-path)
  * [Base URL](#base-url)
  * [Relative paths](#relative-paths)
* [Cachebuster](#cachebuster)
* [Image dimensions](#image-dimensions)
* [Inlining files](#inlining-files)
* [Full list of options](#full-list-of-options)

Terms of use
------------

By using this project or its source code, for any purpose and in any shape or form, you grant your **implicit agreement** to all the following statements:

- You **condemn Russia and its military aggression against Ukraine**
- You **recognize that Russia is an occupant that unlawfully invaded a sovereign state**
- You **support Ukraine's territorial integrity, including its claims over temporarily occupied territories of Crimea and Donbas**
- You **reject false narratives perpetuated by Russian state propaganda**

Glory to Ukraine! 🇺🇦

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
  var postcss = require('gulp-postcss');
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
        })
      ]
    },
    dist: { src: 'build/*.css' }
  },
});
```

**Note: all of the listed options below are parameters for the ```assets``` object, not the top level postcss options object.**

URL resolution
--------------

These options isolate stylesheets from environmental changes.

### Load paths

To make PostCSS Assets search for files in specific directories, define load paths:

```js
var options = {
  loadPaths: ['fonts/', 'media/patterns/', 'images/']
};
```

Example:

```css
body {
  background: resolve('foobar.jpg');
  background: resolve('icons/baz.png');
}
```

PostCSS Assets would look for the files relative to the source file, then in load paths, then in the base path. If it succeed, it would resolve a true URL:

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

To make resolved paths relative to the input file, set a flag:

```js
var options = {
  relative: true
};
```

To relate to a particular directory, set it as a string:

```js
var options = {
  relative: 'assets/css'
};
```

Cachebuster
-----------

PostCSS Assets can bust assets cache:

```js
var options = {
  cachebuster: true
};
```

Example:

```css
body {
  background: resolve('/images/icons/baz.png');
}
```

PostCSS Assets will change urls depending on asset’s modification date:

```css
body {
  background: url('/images/icons/baz.png?14a931c501f');
}
```

To define a custom cachebuster pass a function as an option:

```js
var options = {
  cachebuster: function (filePath, urlPathname) {
    return fs.statSync(filePath).mtime.getTime().toString(16);
  }
};
```

If the returned value is falsy, no cache busting is done for the asset.

If the returned value is an object the values of `pathname` and/or `query` are used to generate a cache busted path to the asset.

If the returned value is a string, it is added as a query string.

The returned values for query strings must not include the starting `?`.

Busting the cache via path:

```js
var options = {
  cachebuster: function (filePath, urlPathname) {
    var hash = fs.statSync(filePath).mtime.getTime().toString(16);
    return {
      pathname: path.dirname(urlPathname)
        + '/' + path.basename(urlPathname, path.extname(urlPathname))
        + hash + path.extname(urlPathname),
      query: false // you may omit this one
    }
  }
};
```

Image dimensions
----------------

PostCSS Assets calculates dimensions of PNG, JPEG, GIF, SVG and WebP images:

```css
body {
  width: width('images/foobar.png'); /* 320px */
  height: height('images/foobar.png'); /* 240px */
  background-size: size('images/foobar.png'); /* 320px 240px */
}
```

To correct the dimensions for images with a high density, pass it as a second parameter:

```css
body {
  width: width('images/foobar.png', 2); /* 160px */
  height: height('images/foobar.png', 2); /* 120px */
  background-size: size('images/foobar.png', 2); /* 160px 120px */
}
```

Inlining files
--------------

PostCSS inlines files to a stylesheet in Base64 encoding:

```css
body {
  background: inline('images/foobar.png');
}
```

SVG files would be inlined unencoded, because [then they benefit in size](http://css-tricks.com/probably-dont-base64-svg/).

Full list of options
--------------------

| Option        | Description                                                                       | Default |
|:--------------|:----------------------------------------------------------------------------------|:--------|
| `basePath`    | Root directory of the project.                                                    | `.`     |
| `baseUrl`     | URL of the project when running the web server.                                   | `/`     |
| `cachebuster` | If cache should be busted. Pass a function to define custom busting strategy.     | `false` |
| `loadPaths`   | Specific directories to look for the files.                                       | `[]`    |
| `relative`    | Directory to relate to when resolving URLs. When `true`, relates to the input file. When `false`, disables relative URLs. | `false` |
| `cache`       | When `true`, if the input file not been modifed, use the results before cached.   | `false` |
