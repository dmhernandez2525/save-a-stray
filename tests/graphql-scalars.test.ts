import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { Kind } from 'graphql';
import { DateScalar, EmailScalar, URLScalar } from '../server/schema/scalars';

describe('graphql scalars', () => {
  it('accepts and normalizes valid email values', () => {
    const value = EmailScalar.parseValue('USER@EXAMPLE.COM');
    expect(value).toBe('user@example.com');
  });

  it('rejects invalid email values', () => {
    expect(() => EmailScalar.parseValue('invalid-email')).toThrow('Invalid email address.');
  });

  it('accepts valid http and https urls', () => {
    expect(URLScalar.parseValue('https://save-a-stray.org')).toBe('https://save-a-stray.org');
    expect(URLScalar.parseValue('http://save-a-stray.org')).toBe('http://save-a-stray.org');
  });

  it('rejects non-http urls', () => {
    expect(() => URLScalar.parseValue('ftp://save-a-stray.org')).toThrow('Invalid URL value.');
  });

  it('parses date literals and serializes dates to iso strings', () => {
    const parsedDate = DateScalar.parseLiteral({
      kind: Kind.STRING,
      value: '2026-02-01T10:00:00.000Z',
    });

    expect(parsedDate).toBeInstanceOf(Date);
    expect(DateScalar.serialize(parsedDate)).toBe('2026-02-01T10:00:00.000Z');
  });

  it('rejects invalid date values', () => {
    expect(() => DateScalar.parseValue('not-a-date')).toThrow('Invalid ISO date value.');
  });
});
