var gulp = require('gulp');

var javascripts = {
  gulpfile: 'Gulpfile.js',
  source: ['index.js', 'lib/**/*.js'],
  tests: 'test/**/*.js'
};

javascripts.all = Object.keys(javascripts).reduce(function (result, key) {
  return result.concat(javascripts[key]);
}, []);

gulp.task('jscs', function () {
  var jscs = require('gulp-jscs');
  return gulp.src(javascripts.all)
    .pipe(jscs({
      preset: 'yandex',
      disallowMultipleVarDecl: 'exceptUndefined'
    }));
});

gulp.task('lint', function () {
  var jshint = require('gulp-jshint');
  return gulp.src(javascripts.all)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', function () {
  var mocha = require('gulp-mocha');
  return gulp.src(javascripts.tests, {
    read: false
  })
    .pipe(mocha({
      bail: true
    }));
});

gulp.task('watch', function () {
  return gulp.watch(javascripts.all, ['default']);
});

gulp.task('default', ['lint', 'jscs', 'test']);
