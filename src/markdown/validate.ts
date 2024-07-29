import * as fs from 'fs';
import { compile } from '@mdx-js/mdx';
import { remark } from 'remark';
import remarkMdx from 'remark-mdx';
import { VFile } from 'vfile';
import { reporter } from 'vfile-reporter';
import { VFileMessage } from 'vfile-message';

interface FileValidationReport {
  valid: boolean;
  error?: string | null | undefined;
}

/**
 * Check that a file passes the markdown + mdx validation
 * @see https://mdxjs.com/playground/ for an in-browser validation alternative
 *
 * @param filePath string
 * @returns FileValidationReport
 */
const validateFile = async (
  filePath: string
): Promise<FileValidationReport> => {
  const fileContent = await fs.promises.readFile(filePath, 'utf-8');
  const vfile = new VFile({ path: filePath, contents: fileContent });

  try {
    const processor = remark().use(remarkMdx);

    await processor.process(vfile);
    await compile(fileContent);

    return { valid: true };
  } catch (error) {
    // Use vfile to create a human readable error report
    const vfileError = error as VFileMessage;
    vfile.message(vfileError.message, vfileError.place);

    return { valid: false, error: reporter([vfile]) };
  }
};

export default validateFile;
