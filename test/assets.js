var fs = require('fs');
var path = require('path');
var plugin = require('..');
var postcss = require('postcss');
var test = require('ava');

function fixture(name) {
  return 'fixtures/' + name + '.css';
}

function readFixture(name) {
  return fs.readFileSync(fixture(name), 'utf8').trim();
}

function processFixture(name, options, postcssOptions) {
  var css = readFixture(name);
  return postcss().use(plugin(options)).process(css, postcssOptions)
    .then(function (result) {
      return result.css.trim();
    });
}

function validate(name, options, postcssOptions) {
  return function (t) {
    var expectedResult = readFixture(name + '.expected');
    return processFixture(name, options, postcssOptions)
      .then(function (actualResult) {
        t.is(actualResult, expectedResult);
      });
  };
}

function modifyFile(pathString) {
  var atime = fs.statSync(pathString).atime;
  var mtime = new Date();
  fs.utimesSync(pathString, atime, mtime);
}

test('plugin should have a postcss method for a PostCSS Root node to be passed', function (t) {
  var expectedResult = readFixture('resolve.expected');
  return postcss().use(plugin.postcss).process(readFixture('resolve'))
    .then(function (result) {
      var actualResult = result.css.trim();
      t.is(actualResult, expectedResult);
    });
});

test('resolve should resolve paths', validate('resolve'));

test('resolve should resolve relative to the base path', validate('resolve-basepath', {
  basePath: 'fixtures'
}));

test('resolve should resolve relative to the load paths', validate('resolve-loadpath', {
  basePath: 'fixtures',
  loadPaths: ['alpha/', 'beta/']
}));

test('resolve should resolve relative to the load paths of a funky spelling', validate('resolve-loadpath', {
  basePath: 'fixtures',
  loadPaths: ['./alpha/', 'beta']
}));

test('resolve should resolve relative to the base URL', validate('resolve-baseurl', {
  basePath: 'fixtures',
  baseUrl: '/content/theme/'
}));

test('resolve should resolve relative to the base URL respecting domain', validate('resolve-baseurl-domain', {
  basePath: 'fixtures',
  baseUrl: 'http://example.com'
}));

test('resolve should resolve from source file location', validate('resolve-from-source', {
  loadPaths: ['fixtures/alpha']
}, {
  from: fixture('resolve-from-source')
}));

test('resolve should resolve relative paths', validate('resolve-relative-to', {
  basePath: 'fixtures',
  relativeTo: 'beta'
}));

test('resolve should recognize funky spelling', validate('resolve-spelling', {
  basePath: 'fixtures',
  loadPaths: ['alpha/']
}));

test('resolve should reject with an error when an asset is unavailable', function (t) {
  return processFixture('resolve-invalid')
    .catch(function (err) {
      t.ok(err instanceof Error);
      t.ok(err.message.includes('Asset not found or unreadable'));
    });
});

test('resolve should bust cache', function (t) {
  var options = {
    cachebuster: true,
    loadPaths: ['fixtures/alpha/']
  };

  var resultA = processFixture('resolve-cachebuster', options);
  modifyFile('fixtures/alpha/kateryna.jpg');

  var resultB = processFixture('resolve-cachebuster', options);

  t.not(resultA, resultB);
});

test('resolve should accept custom buster function returning a string', validate('resolve-cachebuster-string', {
  cachebuster: function () {
    return 'cachebuster';
  },
  loadPaths: ['fixtures/alpha/']
}));

test('resolve should accept custom buster function returning an object', validate('resolve-cachebuster-object', {
  cachebuster: function (filePath, urlPathname) {
    var filename = path.basename(urlPathname, path.extname(urlPathname)) + '.cache' + path.extname(urlPathname);
    return {
      pathname: path.dirname(urlPathname) + '/' + filename,
      query: 'buster'
    };
  },
  loadPaths: ['fixtures/alpha/']
}));

test('resolve should accept custom buster function returning a falsy value', validate('resolve-cachebuster-falsy', {
  cachebuster: function () {
    return;
  },
  loadPaths: ['fixtures/alpha/']
}));

test('inline should base64-encode assets', validate('inline', {
  basePath: 'fixtures/'
}));

test('width, height and size should resolve dimensions', validate('dimensions', {
  basePath: 'fixtures/'
}));

test('width, height and size should reject with an error when an image is corrupted', function (t) {
  return processFixture('dimensions-invalid')
    .catch(function (err) {
      t.ok(err instanceof Error);
      t.ok(err.message.includes('File type not supported'));
    });
});
