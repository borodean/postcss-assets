var gulp = require('gulp');

gulp.task('test', function () {
  require('babel/register')({
    // All the subsequent files required by node with the extension of `.es6`
    // will be transformed to ES5
    extensions: ['.es6']
  });
  var mocha = require('gulp-mocha');
  return gulp.src('test/**/*.es6', {
    read: false
  })
    .pipe(mocha({
      bail: true
    }));
});

gulp.task('watch', ['default'], function () {
  gulp.watch([
    'index.js',
    'lib/**/*.es6',
    'test/**/*.es6'
  ], ['default']);
});

gulp.task('default', ['test']);
