import { describe, expect, it, vi } from 'vitest';
import getCommandArgs from './getCommandArgs';

describe('getCommandArgs', () => {
  it('only returns the user argument', () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue([
      'node',
      'dist/importer.js',
      'foobar',
    ]);
    expect(getCommandArgs()).toEqual(['foobar']);
  });
});
