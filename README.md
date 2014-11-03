PostCSS Assets
==============

An asset manager for CSS.

Usage
-----

### [Gulp PostCSS](https://github.com/w0rm/gulp-postcss)

```js
gulp.task('assets', function () {
  var postcss = require('postcss');
  var assets  = require('postcss-assets');

  return gulp.src('source/*.css')
    .pipe(postcss([ assets() ]))
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
        assets().postcss
      ]
    },
    dist: { src: 'build/*.css' }
  },
});
```
