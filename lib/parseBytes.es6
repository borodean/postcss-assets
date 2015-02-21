export default function (string) {
  var value, unit;
  string = string.toString();
  value = parseFloat(string, 10);
  unit = string.slice(-1).toUpperCase();
  switch (unit) {
  case 'K':
    value *= 1024;
    break;
  case 'M':
    value *= Math.pow(1024, 2);
    break;
  }
  return Math.floor(value);
}
