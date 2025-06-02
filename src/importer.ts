import * as path from 'path';
import * as os from 'os';
import fs from 'fs-extra';

import cloneAndCheckout from './git/cloneAndCheckout';
import processDocumentDirectories from './processDocumentDirectories';
import outputResults from './logger/output';
import getLocalDirectoryPath from './utils/getLocalDirectoryPath';

const remoteUrl = 'git@github.com:Amsterdam/development-standards.git';
// Local target directory
const localDir = path.resolve(getLocalDirectoryPath());
// Temporary directory for cloning the repo
const tempDir = path.join(os.tmpdir(), 'development-standards');

async function cleanObsoleteFiles(docsPath: string, referencePath: string) {
  // Get list of current and reference files
  const existingFiles = await fs.readdir(docsPath);
  const referenceFiles = await fs.readdir(referencePath);

  // Delete files in docsPath that don't exist in referencePath
  const filesToDelete = existingFiles.filter(file => !referenceFiles.includes(file));
  for (const file of filesToDelete) {
    await fs.remove(path.join(docsPath, file));
    console.log(`Deleted from root: ${file}`);
  }

  // Repeat the same logic for specific subfolders
  for (const folder of ['backend', 'frontend', 'general', 'cloud']) {
    const currentPath = path.join(docsPath, folder);
    const referenceFolder = path.join(referencePath, folder);

    // Skip if folder doesn't exist in either path
    if (!(await fs.pathExists(currentPath)) || !(await fs.pathExists(referenceFolder))) continue;

    const existing = await fs.readdir(currentPath);
    const reference = await fs.readdir(referenceFolder);

    // Delete files not present in the reference folder
    const toDelete = existing.filter(file => !reference.includes(file));
    for (const file of toDelete) {
      await fs.remove(path.join(currentPath, file));
      console.log(`Deleted from ${folder}: ${file}`);
    }
  }
}

export async function app(savePath: string) {
  // Clone the remote Git repo into a temp directory
  await cloneAndCheckout(remoteUrl, tempDir);

  // Check if the clone was successful
  const cloneExists = await fs.pathExists(tempDir);
  if (!cloneExists) {
    console.error('Clone directory does not exist:', tempDir);
    return;
  }

  // If local docs already exist, remove outdated files
  const docsExist = await fs.pathExists(savePath);
  if (docsExist) {
    await cleanObsoleteFiles(savePath, tempDir);
  }

  // Process the cloned documents and log any errors
  const errors = await processDocumentDirectories(tempDir, savePath);
  outputResults(errors);

  // Clean up the temp directory
  await fs.remove(tempDir);
}

// Run the app
app(localDir).catch(console.error);
