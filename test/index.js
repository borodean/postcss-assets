var postcss = require('postcss');
var plugin = require('..');

var fs = require('fs');
var test = require('tape');

function fixture(name) {
  return fs.readFileSync('test/fixtures/' + name + '.css', 'utf8').trim();
}

function process(name, opts, postcssOpts) {
  return postcss().use(plugin(opts)).process(fixture(name), postcssOpts).css.trim();
}

function compareFixtures(t, name, msg, opts, postcssOpts) {

  var actual = process(name, opts, postcssOpts);
  var expected = fixture(name + '.expected');

  fs.writeFile('test/fixtures/' + name + '.actual.css', actual);
  t.equal(actual, expected, msg);
}

test('asset', function (t) {

  compareFixtures(t, 'asset', 'resolves paths');

  compareFixtures(t, 'asset-basepath', 'resolves relative to the basePath', {
    basePath: 'test/fixtures'
  });

  compareFixtures(t, 'asset-loadpath', 'resolves relative to the loadPaths', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  });

  compareFixtures(t, 'asset-loadpath', 'resolves with loadPaths of a various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  });

  compareFixtures(t, 'asset-baseurl-1', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  });

  compareFixtures(t, 'asset-baseurl-2', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  });

  compareFixtures(t, 'asset-spelling', 'recognizes various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  });

  t.throws(function () {
    process('asset-notfound', {
      basePath: 'test/fixtures'
    });
  }, false, 'throws an exception');

  t.end();
});

test('asset-inline', function (t) {
  compareFixtures(t, 'inline', 'base64-encodes assets', { basePath: 'test/fixtures/' });
  t.end();
});

test('asset-width, asset-height', function (t) {
  compareFixtures(t, 'dimensions', 'resolves dimensions', { basePath: 'test/fixtures/' });
  t.end();
});
