var gulp = require('gulp');

var javascripts = {
  gulpfile: 'Gulpfile.js',
  source: ['index.js', 'lib/**/*.js'],
  tests: 'test/**/*.js'
};

javascripts.all = Object.keys(javascripts).reduce(function (result, key) {
  return result.concat(javascripts[key]);
}, []);

gulp.task('coveralls', function () {
  var coveralls = require('gulp-coveralls');
  return gulp.src('coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('lint', function () {
  var eshint = require('gulp-eslint');
  return gulp.src(javascripts.all)
    .pipe(eshint())
    .pipe(eshint.format())
    .pipe(eshint.failOnError());
});

gulp.task('test', function (cb) {
  var istanbul = require('gulp-istanbul');
  var mocha = require('gulp-mocha');
  gulp.src(javascripts.source)
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(javascripts.tests)
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .on('end', cb);
    });
});

gulp.task('watch', function () {
  return gulp.watch(javascripts.all, ['default']);
});

gulp.task('default', ['lint', 'test']);
