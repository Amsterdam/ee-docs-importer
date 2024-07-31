import getLocalDirectoryPath from './getLocalDirectoryPath';

describe('getLocalDirectoryPath', () => {
  it('returns user provided argument if it exists', () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValueOnce([
      'node',
      'dist/importer.js',
      'foobar',
    ]);
    expect(getLocalDirectoryPath()).toEqual('foobar');
  });

  it('returns docs if command args are empty', () => {
    vi.spyOn(process, 'argv', 'get').mockReturnValueOnce([
      'node',
      'dist/importer.js',
    ]);
    expect(getLocalDirectoryPath()).toEqual('docs');
  });
});
