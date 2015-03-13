// Native imports
var fs = require('fs');
var path = require('path');

// Vendor imports
var postcss = require('postcss');
var expect = require('chai').expect;

// Local imports
var plugin = require('..');

function fixturePath(name) {
  return 'test/fixtures/' + name + '.css';
}

function fixture(name) {
  return fs.readFileSync(fixturePath(name), 'utf8').trim();
}

function process(css, opts, postcssOpts) {
  return postcss().use(plugin(opts)).process(css, postcssOpts).css.trim();
}

function processFixture(name, opts) {
  return process(fixture(name), opts, {
    from: fixturePath(name)
  });
}

function test(name, options) {
  return function () {
    var actual = processFixture(name, options);
    var expected = fixture(name + '.expected');
    expect(actual).to.equal(expected);
  };
}

function modifyFile(pathString) {
  var atime = fs.statSync(pathString).atime;
  var mtime = new Date();
  fs.utimesSync(pathString, atime, mtime);
}

describe('resolve', function () {
  it('should resolve paths', test('resolve'));

  it('should resolve relative to the base path', test('resolve-basepath', {
    basePath: 'test/fixtures'
  }));

  it('should resolve relative to the load paths', test('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/', 'beta/']
  }));

  it('should resolve relative to the load paths of a funky spelling', test('resolve-loadpath', {
    basePath: 'test/fixtures',
    loadPaths: ['./alpha/', 'beta']
  }));

  it('should resolve relative to the base URL', test('resolve-baseurl-1', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  }));

  it('should resolve relative to the base URL respecting domain', test('resolve-baseurl-2', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  }));

  it('should resolve relative to the CSS file', test('resolve-css-relative-paths', {
    basePath: 'test',
    loadPaths: ['fixtures/alpha']
  }));

  it('should resolve relative paths', test('resolve-relative', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  }));

  it('should recognize funky spelling', test('resolve-spelling', {
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

  it('should accept custom buster function returning a string', function () {
    test('cachebuster-string', {
      cachebuster: function () {
        return 'cachebuster';
      },
      loadPaths: ['test/fixtures/alpha/']
    })();
  });

  it('should accept custom buster function returning an object', function () {
    test('cachebuster-object', {
      cachebuster: function (filePath, urlPathname) {
        var filename = path.basename(urlPathname, path.extname(urlPathname)) + '.cache' + path.extname(urlPathname);
        return {
          pathname: path.dirname(urlPathname) + '/' + filename,
          query: 'buster'
        };
      },
      loadPaths: ['test/fixtures/alpha/']
    })();
  });

  it('should accept custom buster function returning a falsy value', function () {
    test('cachebuster-falsy', {
      cachebuster: function () {
        return;
      },
      loadPaths: ['test/fixtures/alpha/']
    })();
  });
});

describe('inline', function () {
  it('should base64-encode assets', test('inline', {
    basePath: 'test/fixtures/'
  }));
});

describe('width, height and size', function () {
  it('should resolve dimensions', test('dimensions', {
    basePath: 'test/fixtures/'
  }));

  it('should throw an error when an image is corrupted', function () {
    expect(function () {
      process('body { width: width("test/fixtures/alpha/invalid.jpg"); }');
    }).to.throw('Image corrupted');
  });
});
