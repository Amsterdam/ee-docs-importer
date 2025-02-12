import * as path from 'path';
import * as fs from 'fs';
import isImage from 'is-image';
import validateMarkdownFile from './markdown/validate';

export interface ProcessedFile {
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
  srcDir: string,
  excludeFiles?: string[]
): Promise<ProcessedFile[]> => {
  const processed: ProcessedFile[] = [];

  if (fs.existsSync(srcDir)) {
    // Create an attachments directory if it doesn't exist
    const attachmentsDir = path.join(srcDir, 'attachments');
    if (!fs.existsSync(attachmentsDir)) {
      fs.mkdirSync(attachmentsDir);
      console.log(`Created attachments directory: ${attachmentsDir}`);
    }

    // Get files from directory and loop through them
    const filenames = await fs.promises.readdir(srcDir);

    for (const filename of filenames) {
      const srcFilePath = path.join(srcDir, filename);

      // Check if the current item is a file
      if (!fs.lstatSync(srcFilePath).isFile()) {
        console.log(`${srcFilePath} is not a file. Skipping.`);
        continue; // Skip directories or non-file items
      }

      if (!excludeFiles?.includes(filename)) {
        // Process Markdown file(s)
        if (path.extname(filename) === '.md') {
          const { valid, error } = await validateMarkdownFile(srcFilePath);

          processed.push({
            filename,
            valid: valid ?? false,
            error: error ?? undefined,
          });
        }

        if (isImage(srcFilePath)) {
          // TODO image validation would be useful but currently in Node.js it looks
          // limited to checking extensions and mime-types, which is pretty weak.
          // Therefore, as these documents come from an internal repository we trust
          // the image files are valid
          processed.push({
            filename,
            valid: true,
            error: undefined,
          });
        }
      }
    }
  }

  return processed;
};

export default processFiles;
