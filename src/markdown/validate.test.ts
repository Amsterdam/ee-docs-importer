import path from 'path';
import { vol } from 'memfs';
import validateFile from './validate';
import fixture from '../../test/fixtures/example-00.md?raw';

describe('validate', () => {
  it('returns valid with valid markdown', async () => {
    vol.fromJSON(
      {
        'file.md': fixture,
      },
      path.join(path.sep, 'tmp', 'docs')
    );
    const result = await validateFile(
      path.join(path.sep, 'tmp', 'docs', 'file.md')
    );
    expect(result).toEqual({
      valid: true,
      error: undefined,
    });
  });

  it('invalid MDX but valid MD passes as valid', async () => {
    const markdown = `# Store your project in GitHub
    > This page was last reviewed May 7th 2024. It needs to be reviewed again on February 7th, 2025.

    ## How to store projects on Github?
    All projects must have their repository on GitHub in the account of the city of Amsterdam and should be public,
    see the section "Public or private" for allowed exemptions.
    You must use Git to store your code on GitHub.
    Secure your repository by enabling these branch protection rules:
    - Require a pull request before merging
      - Require approvals
        - The required number of approvals before merging is at least 1

    ## When and for whom is this standard?
    This standard applies to all developers.<br/>
    This standard must be applied to all new repositories of the city of Amsterdam (new since May 2024).

    ## Public or private {#status}
    Infra-as-code logic must always be stored in a private repository.
    This improves transparency and reusability,
    but protects us from exposing sensitive information that could benefit potential bad actors.`;

    vol.fromJSON(
      {
        'markdown.md': markdown,
      },
      path.join(path.sep, 'tmp', 'docs')
    );

    const result = await validateFile(
      path.join(path.sep, 'tmp', 'docs', 'markdown.md')
    );
    expect(result.valid).toEqual(true);
  });
});
