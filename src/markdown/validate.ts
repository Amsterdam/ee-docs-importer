import * as fs from 'fs';
import { VFile } from 'vfile';
import isMdValid from './isMdValid';
import isMdxValid from './isMdxValid';

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

  // Validate MDX first as this is more complex
  const mdxValidation = await isMdxValid(fileContent, vfile);

  // If MDX compilation fails, test if it compiles as MD because sometimes
  // valid MD can trigger MDX issues, for example "## Public or private
  // {#status}" will cause an exception with MDX
  if (!mdxValidation.valid) {
    return await isMdValid(fileContent, vfile);
  }

  return mdxValidation;
};

export default validateFile;
