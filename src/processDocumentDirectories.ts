import * as path from 'path';
import * as fs from 'fs';
import processFiles, { ProcessedFile } from './processFiles';

// The directories in the `development-standards` repo that we are interested in
const repoDirs = ['backend', 'frontend', 'general'];

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

const deleteFiles = async (newFiles: string[], targetDir: string) => {
  const currentFiles = await fs.promises.readdir(targetDir);
  currentFiles.forEach(async currentFile => {
    if (!fs.lstatSync(path.join(targetDir, currentFile)).isDirectory()) {
      if (!newFiles.includes(currentFile)) {
        await fs.promises.unlink(path.join(targetDir, currentFile));
      }
    }
  });
};

/**
 * Process the imported repository root directories and files
 * and save any valid markdown files
 */
const processRoot = async (clonedRepoDir: string, targetDir: string) => {
  // Read and validate the markdown files
  const processedFiles = await processFiles(clonedRepoDir, [
    ...repoDirs,
    '.git',
    '.gitignore',
    'CODEOWNERS',
    'LICENSE',
    'README.md',
    'internal',
  ]);

  // Files to copy over from the cloned root directory
  const newFilenames = processedFiles.map(({ filename }) => filename);
  await deleteFiles(newFilenames, targetDir);

  // Copy the files to the final directory
  const invalidFiles: { [key: string]: string | undefined } = await saveFiles(
    processedFiles,
    '.',
    targetDir,
    clonedRepoDir
  );

  return invalidFiles;
};

const processSubDirectories = async (
  clonedRepoDir: string,
  targetDir: string
) => {
  let invalidFiles: { [key: string]: string | undefined } = {};

  // This is currently empty but present in case a directory name requires changing on import
  // For example {general: 'common'} will rename the `general` dir to `common`
  const dirsToRename: { [key: string]: string } = {};

  for (const dir of repoDirs) {
    // Read and validate the markdown files
    const repoDirPath = path.join(clonedRepoDir, dir);
    const processedFiles = await processFiles(repoDirPath);

    // Build the final target path
    const finalTargetDir = dirsToRename[dir]
      ? path.join(targetDir, dirsToRename[dir])
      : path.join(targetDir, dir);

    // Files to copy over from the cloned root directory
    const newFilenames = processedFiles.map(({ filename }) => filename);
    await deleteFiles(newFilenames, finalTargetDir);

    // Copy the files to the final directory
    const dirInvalidFiles = await saveFiles(
      processedFiles,
      dir,
      finalTargetDir,
      clonedRepoDir
    );

    invalidFiles = {
      ...invalidFiles,
      ...dirInvalidFiles,
    };
  }

  return invalidFiles;
};

/**
 * Process the imported repository and save valid markdown files
 */
const processDocumentDirectories = async (
  clonedRepoDir: string,
  targetDir: string
) => {
  // Any files that fail validation will be logged
  const rootInvalidFiles = await processRoot(clonedRepoDir, targetDir);
  const subDirectoryInvalidFiles = await processSubDirectories(
    clonedRepoDir,
    targetDir
  );

  // Erase repo directory
  fs.rmSync(clonedRepoDir, { recursive: true });

  return { ...rootInvalidFiles, ...subDirectoryInvalidFiles };
};

export default processDocumentDirectories;
