import path from 'path';
import getCommandArgs from './getCommandArgs';

describe('getCommandArgs', () => {
  it('only returns the user argument', () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValue([
      'node',
      path.join('dist', 'importer.js'),
      'foobar',
    ]);
    expect(getCommandArgs()).toEqual(['foobar']);
  });
});
