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
import { logger } from '../server/services/logger';

describe('logger', () => {
  const stdoutSpy = jest.spyOn(process.stdout, 'write');
  const stderrSpy = jest.spyOn(process.stderr, 'write');

  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  afterAll(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('writes info logs to stdout', () => {
    logger.info('test_info', { value: 1 });
    expect(stdoutSpy).toHaveBeenCalled();
    const payload = String(stdoutSpy.mock.calls[0][0]);
    expect(payload).toContain('"level":"info"');
    expect(payload).toContain('"message":"test_info"');
  });

  it('writes error logs to stderr', () => {
    logger.error('test_error', { value: 2 });
    expect(stderrSpy).toHaveBeenCalled();
    const payload = String(stderrSpy.mock.calls[0][0]);
    expect(payload).toContain('"level":"error"');
    expect(payload).toContain('"message":"test_error"');
  });
});
