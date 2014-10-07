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

  compareFixtures(t, 'asset-loadpath', 'resolves a path', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  });

  compareFixtures(t, 'asset', 'resolves a path', {
    basePath: 'test/fixtures'
  });

  t.throws(function () {
    process('asset-notfound', {
      basePath: 'test/fixtures'
    });
  });

  compareFixtures(t, 'asset-basepath', 'resolves a path', {
    basePath: 'test/fixtures/alpha/'
  });

  t.end();
});
