import { describe, expect, it } from 'vitest';
import { fs, vol } from 'memfs';
import processDocumentDirectories from './processDocumentDirectories';
import path from 'path';

describe('processDocumentDirectories', () => {
  it('saves only valid files', async () => {
    const files = {
      './repo/backend/intro.md': 'foobar 123',
      './repo/backend/dependencies.md':
        'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      './repo/frontend/intro.md': 'foobar 789',
      './repo/frontend/testing.md':
        'Mattis euismod massa tristique dui aliquam etiam aenean. Et lacus diam montes ridiculus nec risus efficitur.',
    };

    vol.fromJSON(
      {
        ...files,
        docs: null, // create empty dir for the valid markdown files
      },
      '/tmp'
    );

    const localDir = '/tmp/docs';
    const clonedRepoDir = '/tmp/repo'; // docs/latest

    const result = await processDocumentDirectories(localDir, clonedRepoDir);

    // No errors should be returned
    expect(result).toEqual({});

    const filepaths = Object.keys(files);

    // Test each file was copied
    for (const filepath of filepaths) {
      const splitFilename = filepath.split('/');
      const newFilepath = path.join(
        localDir,
        splitFilename[splitFilename.length - 2],
        splitFilename[splitFilename.length - 1]
      );
      expect(fs.existsSync(newFilepath)).toEqual(true);
    }
  });

  it('returns any invalid files', async () => {
    const files = {
      './repo/backend/intro-01.md': 'foobar 123',
      './repo/backend/dependencies-02.md':
        'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      // Intentionally invalid markdown file
      './repo/frontend/testing-03.md':
        "- <https://circleci.com/blog/unit-testing-vs-integration-testing/> - <https://circleci.com/blog/snapshot-testing-with-jest/> - <https://www.geeksforgeeks.org/difference-between-unit-testing-and-integration-testing/> - <https://testing-library.com/docs/guiding-principles/> - Don't test [implementation detail](https://kentcdodds.com/blog/testing-implementation-details) - what to test <https://kentcdodds.com/blog/write-tests> - <https://www.benmvp.com/blog/react-testing-library-best-practices/> - <https://github.com/patternfly/patternfly-react/wiki/React-Testing-Library-Basics,-Best-Practices,-and-Guidelines> - [Clean and flexible way to write fixtures](https://michalzalecki.com/fixtures-the-way-to-manage-sample-and-test-data/)",
      './repo/frontend/accessibility-04.md':
        'Mattis euismod massa tristique dui aliquam etiam aenean. Et lacus diam montes ridiculus nec risus efficitur.',
    };

    vol.fromJSON(
      {
        ...files,
        docs: null, // create empty dir for the valid markdown files
      },
      '/tmp'
    );

    const localDir = '/tmp/docs';
    const clonedRepoDir = '/tmp/repo'; // docs/latest

    const result = await processDocumentDirectories(localDir, clonedRepoDir);

    // No errors should be returned
    expect(result).toHaveProperty('testing-03.md');

    const filepaths = Object.keys(files);

    // Test each file was copied
    for (const filepath of filepaths) {
      // Skip intentionally invalid markdown file
      if (filepath !== './repo/frontend/testing-03.md') {
        const splitFilename = filepath.split('/');
        const newFilepath = path.join(
          localDir,
          splitFilename[splitFilename.length - 2],
          splitFilename[splitFilename.length - 1]
        );
        expect(fs.existsSync(newFilepath)).toEqual(true);
      }
    }
  });
});
