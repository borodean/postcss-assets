var postcss = require('postcss');
var expect = require('chai').expect;

var plugin = require('..');

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
  return process(fixture(name), opts, {
    from: fixturePath(name)
  });
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

describe('resolve', function () {
  it('should resolve paths', compareFixtures('resolve'));

  it('should resolve relative to the base path', compareFixtures('resolve-basepath', {
    basePath: 'test/fixtures'
  }));

  it('should resolve relative to the load paths', compareFixtures('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  }));

  it('should resolve relative to the load paths of a funky spelling', compareFixtures('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  }));

  it('should resolve relative to the base URL', compareFixtures('resolve-baseurl-1', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  }));

  it('should resolve relative to the base URL respecting domain', compareFixtures('resolve-baseurl-2', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  }));

  it('should resolve relative to the CSS file', compareFixtures('resolve-css-relative-paths', {
    basePath: 'test',
    loadPaths: ['fixtures/alpha']
  }));

  it('should resolve relative paths', compareFixtures('resolve-relative', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  }));

  it('should recognize funky spelling', compareFixtures('resolve-spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  }));

  it('should throw an error when an asset is unavailable', function () {
    expect(function () {
      process('body { background: resolve("three-bears.jpg"); }');
    }).to.throw('Asset not found or unreadable');
  });

  it('should bust cache', function () {
    var options = {
      cachebuster: true,
      loadPaths: ['test/fixtures/alpha/']
    };

    var resultA = processFixture('cachebuster', options);
    modifyFile('test/fixtures/alpha/kateryna.jpg');

    var resultB = processFixture('cachebuster', options);

    expect(resultA).to.not.equal(resultB);
  });

  it('should accept custom buster function', function () {
    var options = {
      cachebuster: function (path) {
        return path[path.length - 1];
      },
      loadPaths: ['test/fixtures/alpha/']
    };

    compareFixtures('cachebuster', options)();
  });
});

describe('inline', function () {
  it('should base64-encode assets', compareFixtures('inline', {
    basePath: 'test/fixtures/'
  }));
});

describe('width, height and size', function () {
  it('should resolve dimensions', compareFixtures('dimensions', {
    basePath: 'test/fixtures/'
  }));

  it('should throw an error when an image is corrupted', function () {
    expect(function () {
      process('body { width: width("test/fixtures/alpha/invalid.jpg"); }');
    }).to.throw('Image corrupted');
  });
});
