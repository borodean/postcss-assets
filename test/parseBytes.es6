import { expect } from 'chai';

import parseBytes from '../lib/parseBytes';

describe('parseBytes', function () {
  it('converts numbers', function () {
    expect(parseBytes(128)).to.equal(128);
  });

  it('converts unitless values', function () {
    expect(parseBytes('128')).to.equal(128);
  });

  it('converts kilobytes', function () {
    expect(parseBytes('2k')).to.equal(2048);
  });

  it('converts uppercase units', function () {
    expect(parseBytes('3K')).to.equal(3072);
  });

  it('converts megabytes', function () {
    expect(parseBytes('2m')).to.equal(2097152);
  });

  it('converts fractional numbers', function () {
    expect(parseBytes('25.5k')).to.equal(26112);
  });
});
