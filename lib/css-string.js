var CSSString = function (string) {

  // Pick the first character to discover if there are any quotes
  // and which type do they have
  this.quotes = string[0];

  if (this.quotes === '\'' || this.quotes === '"') {

    // If there were quotes, cut them off to get the value
    this.value = string.slice(1, -1);

  } else {

    // If there were no quotes, store it as it was
    this.value = string;
    this.quotes = '';
  }
};

CSSString.prototype.toString = function () {
  // If there were no quotes and value has quotes inside, then force single quote it
  if (!this.quotes && (this.value.indexOf('\'') !== -1 || this.value.indexOf('"') !== -1)) {
    this.quotes = '\'';
  }

  // Force single quotes
  if (this.quotes === '"') {
    this.quotes = '\'';
  }

  // Wrap the returned string back into quotes
  return this.quotes + this.value + this.quotes;
};

module.exports = CSSString;
