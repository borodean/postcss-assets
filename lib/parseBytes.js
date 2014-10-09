module.exports = function (string) {
  string = string.toString();
  var value = parseFloat(string, 10);
  var unit = string.slice(-1).toUpperCase();
  if (unit === 'K') {
    value *= 1024;
  } else if (unit === 'M') {
    value *= Math.pow(1024, 2);
  }
  return Math.floor(value);
}
