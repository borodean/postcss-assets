import gonzales from 'gonzales';
import list from 'postcss/lib/list';

class CSSString {
  constructor(string) {
    this.quotes = string[0];
    if (this.quotes === "'" || this.quotes === '"') {
      this.value = string.slice(1, -1);
    } else {
      this.value = string;
      this.quotes = '';
    }
  }

  toString() {
    if (!this.quotes && (this.value.indexOf("'") !== -1 || this.value.indexOf('"') !== -1)) {
      this.quotes = "'";
    }
    if (this.quotes === '"') {
      this.quotes = "'";
    }
    return this.quotes + this.value + this.quotes;
  }
}

export default function (cssValue, map) {
  var ast, traverse;
  ast = gonzales.srcToCSSP(cssValue, 'value');
  traverse = function (node) {
    var body, children, method, name, type;
    type = node[0];
    children = node.slice(1);
    if (type === 'funktion') {
      name = children[0][1];
      body = children[1].slice(1).map(function (x) {
        return gonzales.csspToSrc(traverse(x));
      }).join('');
      method = map[name];
      if (typeof method === 'function') {
        return ['raw', method.apply(this, list.comma(body).map(function (param) {
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
}
