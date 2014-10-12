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

test('path resolving', function (t) {

  compareFixtures(t, 'resolve', 'resolves paths');

  compareFixtures(t, 'resolve-basepath', 'resolves relative to the basePath', {
    basePath: 'test/fixtures'
  });

  compareFixtures(t, 'resolve-loadpath', 'resolves relative to the loadPaths', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  });

  compareFixtures(t, 'resolve-loadpath', 'resolves with loadPaths of a various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  });

  compareFixtures(t, 'resolve-baseurl-1', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  });

  compareFixtures(t, 'resolve-baseurl-2', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  });

  compareFixtures(t, 'resolve-relative', 'resolves relative paths', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  });

  compareFixtures(t, 'resolve-spelling', 'recognizes various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  });

  t.throws(function () {
    process('resolve-notfound', {
      basePath: 'test/fixtures'
    });
  }, false, 'throws an exception');

  t.end();
});

test('path inlining', function (t) {

  compareFixtures(t, 'inline', 'base64-encodes matching assets', {
    basePath: 'test/fixtures/',
    inline: {
      maxSize: '2K'
    }
  });

  t.end();
});

test('dimensions', function (t) {
  compareFixtures(t, 'dimensions', 'resolves dimensions', { basePath: 'test/fixtures/' });
  t.end();
});

require('./lib/parseBytes');
