import * as path from 'path';
import cloneAndCheckout from './git/cloneAndCheckout';
import processDocumentDirectories from './processDocumentDirectories';
import outputResults from './logger/output';
import getLocalDirectoryPath from './utils/getLocalDirectoryPath';

const remoteUrl = 'git@github.com:Amsterdam/development-standards.git';
const localDir = getLocalDirectoryPath();
const cloneDir = path.join(localDir, 'latest');

export async function app(savePath: string) {
  // Clone the latest development-standards repo
  await cloneAndCheckout(remoteUrl, cloneDir, 'feature/md-validation').then(
    async () => {
      const errors = await processDocumentDirectories(savePath, cloneDir);
      outputResults(errors);
    }
  );
}

app(localDir).catch(console.error);
