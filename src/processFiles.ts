import * as path from 'path';
import * as fs from 'fs';
import validateFile from './markdown/validate';

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
        const { valid, error } = await validateFile(srcFilePath);

        processed.push({
          filename,
          valid: valid ?? false,
          error: error ?? undefined,
        });

        // Process images if the file is a valid markdown file
        if (valid && filename.endsWith('.md')) {
          const content = fs.readFileSync(srcFilePath, 'utf8');
          const imageRegex = /!\[.*?\]\((.*?)\)/g;
          let match;
          let imageCount = 0;

          let updatedContent = content; // For updating Markdown with new paths

          while ((match = imageRegex.exec(content)) !== null) {
            const imagePath = match[1]; // Extract the image path

            if (imageCount >= 10) {
              console.warn(
                `Too many images in ${filename}. Skipping further attachments.`
              );
              break;
            }

            const absoluteImagePath = path.join(srcDir, imagePath);
            const imageName = path.basename(imagePath);
            const newImagePath = path.join(attachmentsDir, imageName);

            if (fs.existsSync(absoluteImagePath)) {
              fs.copyFileSync(absoluteImagePath, newImagePath);
              console.log(`Copied image: ${absoluteImagePath} to ${newImagePath}`);

              // Update the Markdown content with the new image path
              updatedContent = updatedContent.replace(
                imagePath,
                `attachments/${imageName}`
              );
              imageCount++;
            } else {
              console.warn(`Image not found: ${absoluteImagePath}`);
            }
          }

          // Write updated Markdown content back to the file
          fs.writeFileSync(srcFilePath, updatedContent, 'utf8');
        }
      }
    }
  }

  return processed;
};

export default processFiles;
