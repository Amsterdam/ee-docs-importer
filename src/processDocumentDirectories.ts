import * as path from 'path';
import * as fs from 'fs';
import processFiles from './processFiles';

const saveFile = async (
  currentDir: string,
  currentFilename: string,
  clonedRepoDir: string,
  targetDir: string
) => {
  // Create dir if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  await fs.promises.rename(
    path.join(clonedRepoDir, currentDir, currentFilename),
    path.join(targetDir, currentFilename)
  );
};

/**
 * Process the imported repository directories and save valid markdown files
 */
const processDocumentDirectories = async (
  localDir: string,
  clonedRepoDir: string
) => {
  // Any files that fail validation will be logged here
  const invalidFiles: { [key: string]: string | undefined } = {};

  // The directories in the `development-standards` repo that we are interested in
  const dirs = ['backend', 'cloud', 'frontend', 'general'];

  // This is currently empty but present in case a directory name requires changing on import
  // For example {general: 'common'} will rename the `general` dir to `common`
  const dirsToRename: { [key: string]: string } = {};

  for (const dir of dirs) {
    const processedFiles = await processFiles(dir, clonedRepoDir);

    // Copy each valid file
    for (const file of processedFiles) {
      if (file.valid) {
        const targetDir = dirsToRename[dir]
          ? path.join(localDir, dirsToRename[dir])
          : path.join(localDir, dir);

        await saveFile(dir, file.filename, clonedRepoDir, targetDir);
      } else {
        invalidFiles[file.filename] = file.error;
      }
    }
  }

  // Erase repo directory
  fs.rmSync(clonedRepoDir, { recursive: true });

  return invalidFiles;
};

export default processDocumentDirectories;
