var gulp = require('gulp');

gulp.task('test', function () {
  var mocha = require('gulp-mocha');
  return gulp.src('test/index.js', {
    read: false
  })
    .pipe(mocha());
});

gulp.task('watch', ['default'], function () {
  gulp.watch([
    'index.js',
    'lib/**/*.es6',
    'test/index.js',
    'test/**/*.es6'
  ], ['default']);
});

gulp.task('default', ['test']);
