var gonzales = require('gonzales');
var list = require('postcss/lib/list');

function CSSString (str) {
  this.quotes = str[0];

  if (this.quotes === "'" || this.quotes === '"') {
    this.value = str.slice(1, -1);
  } else {
    this.value = str;
    this.quotes = '';
  }
}

CSSString.prototype.toString = function () {
  if (!this.quotes && (this.value.indexOf("'") !== -1 || this.value.indexOf('"') !== -1)) {
    this.quotes = "'";
  }

  if (this.quotes === '"') {
    this.quotes = "'";
  }

  return this.quotes + this.value + this.quotes;
};

module.exports = function mapFunctions(cssValue, map) {
  var ast = gonzales.srcToCSSP(cssValue, 'value');

  var traverse = function (node) {
    var type = node[0];
    var children = node.slice(1);

    if (type === 'funktion') {
      var name = children[0][1];
      var body = children[1].slice(1).map(function (x) {
        return gonzales.csspToSrc(traverse(x));;
      }).join('');

      var process = map[name];

      if (typeof process === 'function') {
        return ['raw', process.apply(this, list.comma(body).map(function (param) {
          return new CSSString(param);
        }))];
      }
    }

    return [type].concat(children.map(function (child) {
      if (Array.isArray(child)) {
        return traverse(child);
      }

      return child;
    }));
  };

  return gonzales.csspToSrc(traverse(ast));
};
