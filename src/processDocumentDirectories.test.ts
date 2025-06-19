import path from 'path';
import { fs, vol } from 'memfs';
import processDocumentDirectories from './processDocumentDirectories';

describe('processDocumentDirectories', () => {
  it('saves only valid files', async () => {
    const files = {
      './repo/backend/intro.md': 'foobar 123',
      './repo/intro.md': 'welcome to the application',
      './repo/backend/dependencies.md':
        'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      [path.join('repo', 'frontend', 'intro.md')]: 'foobar 789',
      [path.join('repo', 'frontend', 'testing.md')]:
        'Mattis euismod massa tristique dui aliquam etiam aenean. Et lacus diam montes ridiculus nec risus efficitur.',
    };

    vol.fromJSON(
      {
        ...files,
        docs: null,
        'docs/backend': null,
        'docs/frontend': null,
        'docs/general': null,
      },
      path.join(path.sep, 'tmp')
    );

    const localDir = path.join(path.sep, 'tmp', 'docs');
    const clonedRepoDir = path.join(path.sep, 'tmp', 'repo'); // docs/latest

    const result = await processDocumentDirectories(clonedRepoDir, localDir);

    // No errors should be returned
    expect(result).toEqual({});

    const filepaths = Object.keys(files);

    // Test that each file was copied
    for (const filepath of filepaths) {
      const splitFilename = filepath.split('/');
      // We copy Markdown files from the root directory (except README.md) and files
      // from the `backend`, `cloud`, `frontend`, `general` directories. This creates
      // the file path
      const newFilepath =
        splitFilename[splitFilename.length - 2] === 'repo'
          ? path.join(localDir, splitFilename[splitFilename.length - 1])
          : path.join(
              localDir,
              splitFilename[splitFilename.length - 2],
              splitFilename[splitFilename.length - 1]
            );
      expect(fs.existsSync(newFilepath)).toEqual(true);
    }
  });

  it('returns any invalid files', async () => {
    const files = {
      './repo/intro.md': 'welcome to the application',
      './repo/backend/intro-01.md': 'foobar 123',
      './repo/backend/dependencies-02.md':
        'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      // './repo/backend/dependencies-02.md':
      //   'Lorem ipsum odor amet, consectetuer adipiscing elit. Potenti congue placerat rutrum lacinia varius nostra blandit.',
      // Intentionally invalid markdown file
      // './repo/frontend/testing-03.md': `## References
      [path.join('repo', 'frontend', 'testing-03.md')]: `## References

      - <https://circleci.com/blog/unit-testing-vs-integration-testing/>
      - <https://circleci.com/blog/snapshot-testing-with-jest/>
      - <https://www.geeksforgeeks.org/difference-between-unit-testing-and-integration-testing/>
      - <https://testing-library.com/docs/guiding-principles/>
      - Don't test [implementation detail](https://kentcdodds.com/blog/testing-implementation-details)
      - what to test <https://kentcdodds.com/blog/write-tests>
      - <https://www.benmvp.com/blog/react-testing-library-best-practices/>
      - <https://github.com/patternfly/patternfly-react/wiki/React-Testing-Library-Basics,-Best-Practices,-and-Guidelines>
      - [Clean and flexible way to write fixtures](https://michalzalecki.com/fixtures-the-way-to-manage-sample-and-test-data/)`,
      './repo/frontend/accessibility-04.md':
        'Mattis euismod massa tristique dui aliquam etiam aenean. Et lacus diam montes ridiculus nec risus efficitur.',
    };

    vol.fromJSON(
      {
        ...files,
        docs: null,
        'docs/backend': null,
        'docs/frontend': null,
        'docs/general': null,
      },
      path.join(path.sep, 'tmp')
    );

    const localDir = path.join(path.sep, 'tmp', 'docs');
    const clonedRepoDir = path.join(path.sep, 'tmp', 'repo'); // docs/latest

    const result = await processDocumentDirectories(clonedRepoDir, localDir);

    // No errors should be returned
    expect(result).toHaveProperty('testing-03.md');
    const filepaths = Object.keys(files);

    // Test each file was copied
    for (const filepath of filepaths) {
      // Skip intentionally invalid markdown file
      if (!filepath.endsWith('testing-03.md')) {
        const splitFilename = filepath.split('/');
        // We copy Markdown files from the root directory (except README.md) and files
        // from the `backend`, `cloud`, `frontend`, `general` directories. This creates
        // the file path
        const newFilepath =
          splitFilename[splitFilename.length - 2] === 'repo'
            ? path.join(localDir, splitFilename[splitFilename.length - 1])
            : path.join(
                localDir,
                splitFilename[splitFilename.length - 2],
                splitFilename[splitFilename.length - 1]
              );
        expect(fs.existsSync(newFilepath)).toEqual(true);
      }
    }
  });
  it('verifies old files in the root target directory are deleted', async () => {
    // Initial state of target directories
    const initialTargetFiles = {
      './docs/old-root-doc.md': 'This root file should be deleted.',
      './docs/shared-root-doc.md': 'This root file should persist.',
      './docs/backend/existing-backend-doc.md':
        'This backend file should persist.',
    };

    // Files in the cloned repository (source)
    const filesInRepo = {
      './repo/shared-root-doc.md': 'Updated content for shared root file.',
      './repo/new-root-doc.md': 'This is a new root file.',
      './repo/backend/existing-backend-doc.md':
        'Content for existing backend doc.',
      './repo/backend/new-backend-doc.md': 'This is a new backend file.',
    };

    vol.fromJSON(
      {
        ...initialTargetFiles,
        ...filesInRepo,
        'docs/backend': null,
        'docs/frontend': null,
        'docs/general': null,
      },
      path.join(path.sep, 'tmp')
    );

    const localDir = path.join(path.sep, 'tmp', 'docs');
    const clonedRepoDir = path.join(path.sep, 'tmp', 'repo');

    await processDocumentDirectories(clonedRepoDir, localDir);

    // Verify root files that should have been deleted
    expect(fs.existsSync(path.join(localDir, 'old-root-doc.md'))).toEqual(
      false
    );

    // Verify root files that should persist or be updated
    expect(fs.existsSync(path.join(localDir, 'shared-root-doc.md'))).toEqual(
      true
    );
    expect(
      fs.readFileSync(path.join(localDir, 'shared-root-doc.md'), 'utf8')
    ).toEqual('Updated content for shared root file.');

    // Verify new root files are copied
    expect(fs.existsSync(path.join(localDir, 'new-root-doc.md'))).toEqual(true);

    // Verify that files in subdirectories are not affected by root-level cleanup if they exist in source
    expect(
      fs.existsSync(path.join(localDir, 'backend', 'existing-backend-doc.md'))
    ).toEqual(true);
    expect(
      fs.existsSync(path.join(localDir, 'backend', 'new-backend-doc.md'))
    ).toEqual(true);

    // Verify the cloned repo directory is erased
    expect(fs.existsSync(clonedRepoDir)).toEqual(false);
  });

  it('verifies old files in subdirectories are deleted', async () => {
    // Initial state of target directories
    const initialTargetFiles = {
      './docs/backend/old-backend-doc.md':
        'This backend file should be deleted.',
      './docs/backend/shared-backend-doc.md':
        'This backend file should persist.',
      './docs/frontend/old-frontend-doc.md':
        'This frontend file should be deleted.',
      './docs/root-doc.md': 'This root file should persist.', // Ensure root files are not affected by subdir cleanup
    };

    // Files in the cloned repository (source)
    const filesInRepo = {
      './repo/backend/shared-backend-doc.md':
        'Updated content for shared backend file.',
      './repo/backend/new-backend-doc.md': 'This is a new backend file.',
      './repo/frontend/new-frontend-doc.md': 'This is a new frontend file.',
      './repo/root-doc.md': 'Content for root doc.',
    };

    vol.fromJSON(
      {
        ...initialTargetFiles,
        ...filesInRepo,
        'docs/backend': null,
        'docs/frontend': null,
        'docs/general': null,
      },
      path.join(path.sep, 'tmp')
    );

    const localDir = path.join(path.sep, 'tmp', 'docs');
    const clonedRepoDir = path.join(path.sep, 'tmp', 'repo');

    await processDocumentDirectories(clonedRepoDir, localDir);

    // Verify subdirectory files that should have been deleted
    expect(
      fs.existsSync(path.join(localDir, 'backend', 'old-backend-doc.md'))
    ).toEqual(false);
    expect(
      fs.existsSync(path.join(localDir, 'frontend', 'old-frontend-doc.md'))
    ).toEqual(false);

    // Verify subdirectory files that should persist or be updated
    expect(
      fs.existsSync(path.join(localDir, 'backend', 'shared-backend-doc.md'))
    ).toEqual(true);
    expect(
      fs.readFileSync(
        path.join(localDir, 'backend', 'shared-backend-doc.md'),
        'utf8'
      )
    ).toEqual('Updated content for shared backend file.');

    // Verify new subdirectory files are copied
    expect(
      fs.existsSync(path.join(localDir, 'backend', 'new-backend-doc.md'))
    ).toEqual(true);
    expect(
      fs.existsSync(path.join(localDir, 'frontend', 'new-frontend-doc.md'))
    ).toEqual(true);

    // Verify root files are unaffected by subdirectory cleanup
    expect(fs.existsSync(path.join(localDir, 'root-doc.md'))).toEqual(true);

    // Verify the cloned repo directory is erased
    expect(fs.existsSync(clonedRepoDir)).toEqual(false);
  });
});
