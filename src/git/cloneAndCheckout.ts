import { simpleGit, CleanOptions, SimpleGit } from 'simple-git';

const cloneAndCheckout = async (
  repoUrl: string,
  targetDir: string,
  branchName = 'main'
): Promise<void> => {
  const git: SimpleGit = simpleGit().clean(CleanOptions.DRY_RUN);

  try {
    // Clone the repository and change the current directory otherwise simple-git
    // commands will run based on this application's git config
    await git.clone(repoUrl, targetDir).cwd({ path: targetDir });

    if (branchName !== 'main') {
      // Change to the desired branch
      await git.checkout(branchName);
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
};

export default cloneAndCheckout;
