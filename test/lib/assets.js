var postcss = require('postcss');
var expect = require('chai').expect;

var plugin = require('../../lib/assets');

var fs = require('fs');

function fixturePath(name) {
  return 'test/fixtures/' + name + '.css';
}

function fixture(name) {
  return fs.readFileSync(fixturePath(name), 'utf8').trim();
}

function process(css, opts, postcssOpts) {
  return postcss().use(plugin(opts)).process(css, postcssOpts).css.trim();
}

function processFixture(name, opts, postcssOpts) {
  return process(fixture(name), opts, { from: fixturePath(name) });
}

function compareFixtures(name, opts, postcssOpts) {
  return function () {
    var actual = processFixture(name, opts, postcssOpts);
    var expected = fixture(name + '.expected');

    fs.writeFile('test/fixtures/' + name + '.actual.css', actual);
    expect(actual).to.equal(expected);
  };
}

function modifyFile(path) {
  var atime = fs.statSync(path).atime;
  var mtime = new Date();
  fs.utimesSync(path, atime, mtime);
}

describe('path resolving', function () {
  it('resolves paths', compareFixtures('resolve'));

  it('resolves relative to the basePath', compareFixtures('resolve-basepath', {
    basePath: 'test/fixtures'
  }));

  it('resolves relative to the loadPaths', compareFixtures('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  }));

  it('resolves with loadPaths of a various spelling', compareFixtures('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  }));

  it('resolves relative to the baseUrl', compareFixtures('resolve-baseurl-1', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  }));

  it('resolves relative to the baseUrl', compareFixtures('resolve-baseurl-2', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  }));

  it('resolves relative to the CSS file', compareFixtures('resolve-css-relative-paths', {
    basePath: 'test',
    loadPaths: ['fixtures/alpha']
  }));

  it('resolves relative paths', compareFixtures('resolve-relative', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  }));

  it('recognizes various spelling', compareFixtures('resolve-spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  }));

  it('throws an error', function () {
    expect(function () {
      process('body { background: resolve("three-bears.jpg"); }');
    }).to.throw('Asset not found or unreadable');
  });
});

describe('path inlining', function () {
  it('base64-encodes assets', compareFixtures('inline', { basePath: 'test/fixtures/' }));
});

describe('dimensions', function () {
  it('resolves dimensions', compareFixtures('dimensions', { basePath: 'test/fixtures/' }));

  it('throws an error', function () {
    expect(function () {
      process('body { width: width("test/fixtures/alpha/invalid.jpg"); }');
    }).to.throw('Image corrupted');
  });
});

describe('cachebuster', function () {
  it('busts cache', function () {
    var options = {
      cachebuster: true,
      loadPaths: ['test/fixtures/alpha/']
    };

    var resultA = processFixture('cachebuster', options);
    modifyFile('test/fixtures/alpha/kateryna.jpg');

    var resultB = processFixture('cachebuster', options);

    expect(resultA).to.not.equal(resultB);
  });

  it('accepts buster function', function () {
    var options = {
      cachebuster: function (path) {
        return path[path.length - 1];
      },
      loadPaths: ['test/fixtures/alpha/']
    };

    compareFixtures('cachebuster', options)();
  });
});
