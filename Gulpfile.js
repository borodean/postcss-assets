var gulp = require('gulp');

gulp.task('test', function () {
  require('./');
  var mocha = require('gulp-mocha');
  return gulp.src('test/**/*.es6', {
    read: false
  })
    .pipe(mocha());
});

gulp.task('watch', ['default'], function () {
  gulp.watch([
    'index.js',
    'lib/**/*.es6',
    'test/**/*.es6'
  ], ['default']);
});

gulp.task('default', ['test']);
