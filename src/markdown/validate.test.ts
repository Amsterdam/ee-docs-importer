import { describe, expect, it, vi } from 'vitest';
import { fs, vol } from 'memfs';
import validateFile from './validate';
import { VFile } from 'vfile';
import { reporter } from 'vfile-reporter';
import { VFileMessage } from 'vfile-message';
import fixture from '../../test/fixtures/example-00.md?raw';

// TODO move mocks to pre-tests hook
// TODO remove need for vitest imports
// TODO file naming + dir structure
// TODO test for import.ts

vi.mock('node:fs', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs;
});
vi.mock('node:fs/promises', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs.promises;
});

describe('validate', () => {
  it('returns valid with valid markdown', async () => {
    vol.fromJSON(
      {
        'file.md': fixture,
      },
      '/tmp/docs'
    );
    const result = await validateFile('/tmp/docs/file.md');
    expect(result).toEqual({
      valid: true,
      error: undefined,
    });
  });

  it('throws an error with invalid markdown', async () => {
    const markdown =
      "- <https://circleci.com/blog/unit-testing-vs-integration-testing/> - <https://circleci.com/blog/snapshot-testing-with-jest/> - <https://www.geeksforgeeks.org/difference-between-unit-testing-and-integration-testing/> - <https://testing-library.com/docs/guiding-principles/> - Don't test [implementation detail](https://kentcdodds.com/blog/testing-implementation-details) - what to test <https://kentcdodds.com/blog/write-tests> - <https://www.benmvp.com/blog/react-testing-library-best-practices/> - <https://github.com/patternfly/patternfly-react/wiki/React-Testing-Library-Basics,-Best-Practices,-and-Guidelines> - [Clean and flexible way to write fixtures](https://michalzalecki.com/fixtures-the-way-to-manage-sample-and-test-data/)";

    vol.fromJSON(
      {
        'markdown.md': markdown,
      },
      '/tmp/docs'
    );

    const error = new Error(
      'Unexpected character `/` (U+002F) before local name, expected a character that can start a name, such as a letter, `$`, or `_` (note: to create a link in MDX, use `[text](url)`)'
    ) as VFileMessage;
    const vfile = new VFile({
      path: '/tmp/docs/markdown.md',
      contents: markdown,
    });

    // @ts-expect-error ts(2769) error.messgae should be string
    vfile.message(error.message, {
      line: 1,
      column: 10,
      offset: 9,
      _index: 0,
      _bufferIndex: 7,
    });

    const result = await validateFile('/tmp/docs/markdown.md');
    expect(result.valid).toEqual(false);
    expect(result.error).toEqual(reporter([vfile]));
  });
});
