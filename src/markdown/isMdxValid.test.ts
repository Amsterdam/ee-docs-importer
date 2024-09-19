import { vol } from 'memfs';
import path from 'path';
import { VFile } from 'vfile';
import { reporter } from 'vfile-reporter';
import { VFileMessage } from 'vfile-message';
import isMdxValid from './isMdxValid';
import fixture from '../../test/fixtures/example-00.md?raw';

describe('isMdxValid', () => {
  it('returns valid with valid markdown', async () => {
    vol.fromJSON(
      {
        'file.md': fixture,
      },
      path.join(path.sep, 'tmp', 'docs')
    );
    const vfile = new VFile({
      path: path.join(path.sep, 'tmp', 'docs', 'file.md'),
      contents: fixture,
    });
    const result = await isMdxValid(fixture, vfile);
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
      path.join(path.sep, 'tmp', 'docs')
    );

    const error = new Error(
      'Unexpected character `/` (U+002F) before local name, expected a character that can start a name, such as a letter, `$`, or `_` (note: to create a link in MDX, use `[text](url)`)'
    ) as VFileMessage;
    const vfile = new VFile({
      path: path.join(path.sep, 'tmp', 'docs', 'markdown.md'),
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

    const result = await isMdxValid(markdown, vfile);
    expect(result.valid).toEqual(false);
    expect(result.error).toEqual(reporter([vfile]));
  });
});
