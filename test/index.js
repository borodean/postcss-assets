var postcss = require('postcss');
var plugin = require('..');

var fs = require('fs');
var test = require('tape');

function fixture(name) {
  return fs.readFileSync('test/fixtures/' + name + '.css', 'utf8').trim();
}

function compareFixtures(t, name, msg, opts, postcssOpts) {

  opts = opts || {};

  var actual = postcss().use(plugin(opts)).process(fixture(name), postcssOpts).css.trim();
  var expected = fixture(name + '.expected');

  fs.writeFile('test/fixtures/' + name + '.actual.css', actual);
  t.equal(actual, expected, msg);
}

test('asset', function (t) {

  compareFixtures(t, 'asset-loadpath', 'resolves a path', {
    loadPaths: ['alpha/', 'beta/']
  });
  compareFixtures(t, 'asset', 'resolves a path');

  t.end();
});
