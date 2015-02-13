require('6to5/register')({
  // All the subsequent files required by node with the extension of `.es6`
  // will be transformed to ES5
  extensions: ['.es6']
});

module.exports = require('./lib/assets');
