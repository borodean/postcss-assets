require('babel/register')({
  // All the subsequent files required by node with the extension of `.es6`
  // will be transformed to ES5
  extensions: ['.es6']
});

require('./lib/assets');
require('./lib/mapFunctions');
require('./lib/parseBytes');
require('./lib/unescapeCss');
