import * as path from 'path';
import * as fs from 'fs';
import validateFile from './markdown/validate';

interface ProcessedFile {
  filename: string;
  valid: boolean;
  error: string | undefined;
}

/**
 * Get the valid markdown filenames and distinguish any invalid files
 *
 * @param dir string
 * @returns string[] of valid markdown filenames
 */
const processFiles = async (
  dir: string,
  clonedRepoDir: string
): Promise<ProcessedFile[]> => {
  const processed: ProcessedFile[] = [];
  const srcDir = path.join(clonedRepoDir, dir);

  if (fs.existsSync(srcDir)) {
    // Get files from directory and loop through them
    const filenames = await fs.promises.readdir(srcDir);

    for (const filename of filenames) {
      const srcFilePath = path.join(srcDir, filename);
      const { valid, error } = await validateFile(srcFilePath);

      processed.push({
        filename,
        valid: valid ?? false,
        error: error ?? undefined,
      });
    }
  }

  return processed;
};

export default processFiles;
