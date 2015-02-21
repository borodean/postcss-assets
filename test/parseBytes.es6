import { expect } from 'chai';

import parseBytes from '../lib/parseBytes';

describe('parseBytes()', function () {
  it('should convert numbers', function () {
    expect(parseBytes(128)).to.equal(128);
  });

  it('should convert unitless values', function () {
    expect(parseBytes('128')).to.equal(128);
  });

  it('should convert kilobytes', function () {
    expect(parseBytes('2k')).to.equal(2048);
  });

  it('should convert uppercase units', function () {
    expect(parseBytes('3K')).to.equal(3072);
  });

  it('should convert megabytes', function () {
    expect(parseBytes('2m')).to.equal(2097152);
  });

  it('should convert fractional numbers', function () {
    expect(parseBytes('25.5k')).to.equal(26112);
  });
});
