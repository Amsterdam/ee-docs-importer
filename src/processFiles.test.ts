import { describe, expect, it, vi } from 'vitest';
import { fs, vol } from 'memfs';
import processFiles from './processFiles';
import validateFile from './markdown/validate';

vi.mock('node:fs', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs;
});
vi.mock('node:fs/promises', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs.promises;
});

vi.mock('./markdown/validate');

describe('processFiles', () => {
  it('returns valid files', async () => {
    vi.mocked(validateFile).mockReturnValue(Promise.resolve({ valid: true }));

    const dir = 'backend'; // or cloud, frontend, general
    const clonedRepoDir = '/tmp/repo'; // docs/lates

    vol.fromJSON(
      {
        './repo/backend/intro.md': 'foobar 123',
        './repo/backend/other.md':
          'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      },
      '/tmp'
    );

    const result = await processFiles(dir, clonedRepoDir);
    expect(result).toEqual([
      {
        filename: 'intro.md',
        valid: true,
        error: undefined,
      },
      {
        filename: 'other.md',
        valid: true,
        error: undefined,
      },
    ]);
  });

  it('returns invalid files', async () => {
    vi.mocked(validateFile).mockReturnValue(
      Promise.resolve({
        valid: false,
        error: 'Something has gone wrong',
      })
    );

    const dir = 'backend'; // or cloud, frontend, general
    const clonedRepoDir = '/tmp/repo'; // docs/lates

    vol.fromJSON(
      {
        './repo/backend/intro.md': 'foobar 123',
        './repo/backend/other.md':
          'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      },
      '/tmp'
    );

    const result = await processFiles(dir, clonedRepoDir);
    expect(result).toEqual([
      {
        filename: 'intro.md',
        valid: false,
        error: 'Something has gone wrong',
      },
      {
        filename: 'other.md',
        valid: false,
        error: 'Something has gone wrong',
      },
    ]);
  });
});
