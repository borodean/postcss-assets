// Vendor imports
var gonzales = require('gonzales');
var list = require('postcss/lib/list');

// Local imports
var CSSString = require('./css-string');

module.exports = function (cssValue, map) {
  var ast, traverse;

  // Parse the syntax tree,
  // considering that input is a CSS value
  ast = gonzales.srcToCSSP(cssValue, 'value');

  traverse = function (node) {
    var body, children, method, name, type;

    // The first item of the node array consists of the node type,
    // the rest is its children
    type = node[0];
    children = node.slice(1);

    // As we are mapping functions, the only node type
    // we are interested in are functions itself
    if (type === 'funktion') {

      // Pick an item storing the function name
      name = children[0][1];

      // Recursively traverse function body since it could contain
      // nested functions as well
      body = children[1].slice(1).map(function (x) {
        return gonzales.csspToSrc(traverse(x));
      }).join('');

      // Pick a function implementation from the map provided
      method = map[name];

      // If there is any, process the node throw it
      // and give it back as a node of a `raw` type
      if (typeof method === 'function') {
        return ['raw', method.apply(this, list.comma(body).map(function (param) {
          return new CSSString(param);
        }))];
      }
    }

    // Recursively traverse through every children
    // to find if there any functions nested deeper
    return [type].concat(children.map(function (child) {
      if (Array.isArray(child)) {
        return traverse(child);
      }
      return child;
    }));
  };

  // Convert syntax tree back to a CSS string
  return gonzales.csspToSrc(traverse(ast));
};
