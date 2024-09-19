import { vol } from 'memfs';
import processFiles from './processFiles';
import validateFile from './markdown/validate';
import path from 'path';

vi.mock('./markdown/validate');

describe('processFiles', () => {
  it('returns valid files', async () => {
    vi.mocked(validateFile).mockReturnValue(Promise.resolve({ valid: true }));

    const dir = 'backend'; // or cloud, frontend, general
    const clonedRepoDir = path.join('/', 'tmp', 'repo'); // docs/latest

    vol.fromJSON(
      {
        [path.join('repo', 'backend', 'intro.md')]: 'foobar 123',
        [path.join('repo', 'backend', 'other.md')]:
          'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      },
      path.join('/', 'tmp')
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
    const clonedRepoDir = path.join('/', 'tmp', 'repo'); // docs/latest

    vol.fromJSON(
      {
        [path.join('repo', 'backend', 'intro.md')]: 'foobar 123',
        [path.join('repo', 'backend', 'other.md')]:
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
