var gulp = require('gulp');

gulp.task('test', function () {
  var mocha = require('gulp-mocha');
  return gulp.src('test/**/*.js', {
    read: false
  })
    .pipe(mocha({
      bail: true
    }));
});

gulp.task('watch', function () {
  return gulp.watch([
    'index.js',
    'lib/**/*.js',
    'test/**/*.js'
  ], ['default']);
});

gulp.task('default', ['test']);
