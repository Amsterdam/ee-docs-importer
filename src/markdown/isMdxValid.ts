import { compile } from '@mdx-js/mdx';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { VFile } from 'vfile';
import { reporter } from 'vfile-reporter';
import { VFileMessage } from 'vfile-message';

const isMdxValid = async (fileContent: string, vfile: VFile) => {
  try {
    const processor = remark().use(remarkMdx);
    await processor.process(vfile);
    await compile(fileContent);

    return { valid: true };
  } catch (error) {
    // Markdown line with curly brackets can confuse the MDX compiler, for
    // example: "## Public or private {#status}"
    if (error instanceof VFileMessage) {
      if (
        error.message === 'Could not parse expression with acorn' &&
        error.ancestors === undefined &&
        error.source === 'micromark-extension-mdx-expression'
      ) {
        return { valid: true };
      }
    }

    const vfileError = error as VFileMessage;
    vfile.message(vfileError.message, vfileError.place);

    return { valid: false, error: reporter([vfile]) };
  }
};

export default isMdxValid;
