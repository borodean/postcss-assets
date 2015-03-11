var gulp = require('gulp');

var javascripts = [
  'Gulpfile.js',
  'index.js',
  'lib/**/*.js',
  'test/**/*.js'
];

gulp.task('jscs', function () {
  var jscs = require('gulp-jscs');
  return gulp.src(javascripts)
    .pipe(jscs());
});

gulp.task('lint', function () {
  var jshint = require('gulp-jshint');
  return gulp.src(javascripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

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
  return gulp.watch(javascripts, ['default']);
});

gulp.task('default', ['test']);
