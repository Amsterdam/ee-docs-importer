import * as path from 'path';
import * as os from 'os';
import fs from 'fs-extra';
import cloneAndCheckout from './git/cloneAndCheckout';
import processDocumentDirectories from './processDocumentDirectories';
import outputResults from './logger/output';
import getLocalDirectoryPath from './utils/getLocalDirectoryPath';

const remoteUrl = 'git@github.com:Amsterdam/development-standards.git';
const localDir = path.resolve(getLocalDirectoryPath());
const tempDir = path.join(os.tmpdir(), 'development-standards');

async function cleanObsoleteFiles(docsPath: string, referencePath: string) {
  const existingFiles = await fs.readdir(docsPath);
  const referenceFiles = await fs.readdir(referencePath);

  const filesToDelete = existingFiles.filter(file => !referenceFiles.includes(file));
  for (const file of filesToDelete) {
    await fs.remove(path.join(docsPath, file));
    console.log(`Deleted from root: ${file}`);
  }

  for (const folder of ['backend', 'frontend', 'general', 'cloud']) {
    const currentPath = path.join(docsPath, folder);
    const referenceFolder = path.join(referencePath, folder);

    if (!(await fs.pathExists(currentPath)) || !(await fs.pathExists(referenceFolder))) continue;

    const existing = await fs.readdir(currentPath);
    const reference = await fs.readdir(referenceFolder);

    const toDelete = existing.filter(file => !reference.includes(file));
    for (const file of toDelete) {
      await fs.remove(path.join(currentPath, file));
      console.log(`Deleted from ${folder}: ${file}`);
    }
  }
}

export async function app(savePath: string) {
  await cloneAndCheckout(remoteUrl, tempDir);

  const cloneExists = await fs.pathExists(tempDir);
  if (!cloneExists) {
    console.error('Clone directory does not exist:', tempDir);
    return;
  }

  const docsExist = await fs.pathExists(savePath);
  if (docsExist) {
    await cleanObsoleteFiles(savePath, tempDir);
  }

  const errors = await processDocumentDirectories(tempDir, savePath);
  outputResults(errors);

  await fs.remove(tempDir);
}

app(localDir).catch(console.error);
