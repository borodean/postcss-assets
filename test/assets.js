// Native imports
var fs = require('fs');
var path = require('path');

// Vendor imports
var postcss = require('postcss');
var expect = require('chai').expect;

// Local imports
var plugin = require('..');

function fixture(name) {
  return 'test/fixtures/' + name + '.css';
}

function readFixture(name) {
  return fs.readFileSync(fixture(name), 'utf8').trim();
}

function processFixture(name, options, postcssOptions) {
  var css = readFixture(name);
  return postcss().use(plugin(options)).process(css, postcssOptions).css.trim();
}

function test(name, options, postcssOptions) {
  return function () {
    var actualResult = processFixture(name, options, postcssOptions);
    var expectedResult = readFixture(name + '.expected');
    expect(actualResult).to.equal(expectedResult);
  };
}

function modifyFile(pathString) {
  var atime = fs.statSync(pathString).atime;
  var mtime = new Date();
  fs.utimesSync(pathString, atime, mtime);
}

describe('plugin', function () {
  it('should have a postcss method for a PostCSS Root node to be passed', function () {
    var actualResult = postcss().use(plugin.postcss).process(readFixture('resolve')).css.trim();
    var expectedResult = readFixture('resolve.expected');
    expect(actualResult).to.equal(expectedResult);
  });
});

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

  it('should resolve relative to the base URL', test('resolve-baseurl', {
    basePath: 'test/fixtures',
    baseUrl: '/content/theme/'
  }));

  it('should resolve relative to the base URL respecting domain', test('resolve-baseurl-domain', {
    basePath: 'test/fixtures',
    baseUrl: 'http://example.com'
  }));

  it('should resolve from source file location', test('resolve-from-source', {
    basePath: 'test',
    loadPaths: ['fixtures/alpha']
  }, {
    from: fixture('resolve-from-source')
  }));

  it('should resolve relative paths', test('resolve-relative-to', {
    basePath: 'test/fixtures/alpha',
    relativeTo: 'test/fixtures/beta'
  }));

  it('should recognize funky spelling', test('resolve-spelling', {
    basePath: 'test/fixtures',
    loadPaths: ['alpha/']
  }));

  it('should throw an error when an asset is unavailable', function () {
    expect(function () {
      processFixture('resolve-invalid');
    }).to.throw('Asset not found or unreadable');
  });

  it('should bust cache', function () {
    var options = {
      cachebuster: true,
      loadPaths: ['test/fixtures/alpha/']
    };

    var resultA = processFixture('resolve-cachebuster', options);
    modifyFile('test/fixtures/alpha/kateryna.jpg');

    var resultB = processFixture('resolve-cachebuster', options);

    expect(resultA).to.not.equal(resultB);
  });

  it('should accept custom buster function returning a string', test('resolve-cachebuster-string', {
    cachebuster: function () {
      return 'cachebuster';
    },
    loadPaths: ['test/fixtures/alpha/']
  }));

  it('should accept custom buster function returning an object', test('resolve-cachebuster-object', {
    cachebuster: function (filePath, urlPathname) {
      var filename = path.basename(urlPathname, path.extname(urlPathname)) + '.cache' + path.extname(urlPathname);
      return {
        pathname: path.dirname(urlPathname) + '/' + filename,
        query: 'buster'
      };
    },
    loadPaths: ['test/fixtures/alpha/']
  }));

  it('should accept custom buster function returning a falsy value', test('resolve-cachebuster-falsy', {
    cachebuster: function () {
      return;
    },
    loadPaths: ['test/fixtures/alpha/']
  }));
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
      processFixture('dimensions-invalid');
    }).to.throw('Image corrupted');
  });
});
