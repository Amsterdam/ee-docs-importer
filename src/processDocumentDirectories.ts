import * as path from 'path';
import * as fs from 'fs';
import processFiles, { ProcessedFile } from './processFiles';

// The directories in the `development-standards` repo that we are interested in
const repoDirs = ['backend', 'cloud', 'frontend', 'general'];

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

const saveFiles = async (
  files: ProcessedFile[],
  currentDir: string,
  targetDir: string,
  clonedRepoDir: string
) => {
  // Any files that fail validation will be logged here
  const invalidFiles: { [key: string]: string | undefined } = {};

  for (const file of files) {
    if (file.valid) {
      await saveFile(currentDir, file.filename, clonedRepoDir, targetDir);
    } else {
      invalidFiles[file.filename] = file.error;
    }
  }

  return invalidFiles;
};

const processRoot = async (clonedRepoDir: string, targetDir: string) => {
  const processedFiles = await processFiles(clonedRepoDir, [
    ...repoDirs,
    '.git',
    '.gitignore',
    'LICENSE',
    'README.md',
    'internal',
  ]);
  const invalidFiles: { [key: string]: string | undefined } = await saveFiles(
    processedFiles,
    '.',
    targetDir,
    clonedRepoDir
  );

  return invalidFiles;
};

/**
 * Process the imported repository directories and save valid markdown files
 */
const processDocumentDirectories = async (
  localDir: string,
  clonedRepoDir: string
) => {
  // Any files that fail validation will be logged here
  let dirInvalidFiles: { [key: string]: string | undefined } = {};

  // This is currently empty but present in case a directory name requires changing on import
  // For example {general: 'common'} will rename the `general` dir to `common`
  const dirsToRename: { [key: string]: string } = {};

  for (const dir of repoDirs) {
    const repoDirPath = path.join(clonedRepoDir, dir);
    const processedFiles = await processFiles(repoDirPath);
    const targetDir = dirsToRename[dir]
      ? path.join(localDir, dirsToRename[dir])
      : path.join(localDir, dir);

    const invalidFiles = await saveFiles(
      processedFiles,
      dir,
      targetDir,
      clonedRepoDir
    );

    dirInvalidFiles = {
      ...dirInvalidFiles,
      ...invalidFiles,
    };
  }

  const rootInvalidFiles = await processRoot(clonedRepoDir, localDir);

  // Erase repo directory
  fs.rmSync(clonedRepoDir, { recursive: true });

  return { ...rootInvalidFiles, ...dirInvalidFiles };
};

export default processDocumentDirectories;
