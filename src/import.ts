import * as path from 'path';
import cloneAndCheckout from './git/cloneAndCheckout';
import processDocumentDirectories from './processDocumentDirectories';
import outputResults from './output';

const remoteUrl = 'git@github.com:Amsterdam/development-standards.git';
const localDir = 'docs';
const cloneDir = path.join(localDir, 'latest');

export async function app() {
  // Clone the latest development-standards repo
  await cloneAndCheckout(remoteUrl, cloneDir, 'feature/md-validation').then(
    async () => {
      const errors = await processDocumentDirectories(localDir, cloneDir);
      outputResults(errors);
    }
  );
}

app().catch(console.error);
