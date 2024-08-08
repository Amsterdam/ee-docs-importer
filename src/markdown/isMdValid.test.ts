import { vol } from 'memfs';
import { VFile } from 'vfile';
import isMdValid from './isMdValid';
import fixture from '../../test/fixtures/example-00.md?raw';

describe('isMdValid', () => {
  it('returns valid with valid markdown', async () => {
    vol.fromJSON(
      {
        'file.md': fixture,
      },
      '/tmp/docs'
    );
    const vfile = new VFile({ path: '/tmp/docs/file.md', contents: fixture });
    const result = await isMdValid('/tmp/docs/file.md', vfile);
    expect(result).toEqual({
      valid: true,
      error: undefined,
    });
  });
});
