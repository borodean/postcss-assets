var postcss = require('postcss');

var plugin = require('..');
var parseBytes = require('../lib/parseBytes');

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

test('asset-url', function (t) {

  compareFixtures(t, 'url', 'resolves paths');

  compareFixtures(t, 'url-basepath', 'resolves relative to the basePath', {
    basePath: 'test/fixtures'
  });

  compareFixtures(t, 'url-loadpath', 'resolves relative to the loadPaths', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  });

  compareFixtures(t, 'url-loadpath', 'resolves with loadPaths of a various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  });

  compareFixtures(t, 'url-baseurl-1', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  });

  compareFixtures(t, 'url-baseurl-2', 'resolves relative to the baseUrl', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  });

  compareFixtures(t, 'url-relative', 'resolves relative paths', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  });

  compareFixtures(t, 'url-spelling', 'recognizes various spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  });

  t.throws(function () {
    process('url-notfound', {
      basePath: 'test/fixtures'
    });
  }, false, 'throws an exception');

  t.end();
});

test('asset-inline', function (t) {
  compareFixtures(t, 'inline', 'base64-encodes assets', { basePath: 'test/fixtures/' });
  t.end();
});

test('asset', function (t) {
  compareFixtures(t, 'asset', 'aliases to either asset-url or asset-inline', {
    basePath: 'test/fixtures/',
    inline: {
      maxSize: '2K'
    }
  });
  t.end();
});

test('asset-width, asset-height', function (t) {
  compareFixtures(t, 'dimensions', 'resolves dimensions', { basePath: 'test/fixtures/' });
  t.end();
});

test('parseBytes', function (t) {
  t.equal(parseBytes(128), 128, 'converts numbers');
  t.equal(parseBytes('128'), 128, 'converts unitless values');
  t.equal(parseBytes('2k'), 2048, 'converts kilobytes');
  t.equal(parseBytes('3K'), 3072, 'converts uppercase units');
  t.equal(parseBytes('2m'), 2097152, 'converts megabytes');
  t.equal(parseBytes('25.5k'), 26112, 'converts fractional numbers');
  t.end();
});
