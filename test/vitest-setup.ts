import { vi } from 'vitest';
import { fs } from 'memfs';

vi.mock('node:fs', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs;
});
vi.mock('node:fs/promises', async () => {
  const memfs: { fs: typeof fs } = await vi.importActual('memfs');

  return memfs.fs.promises;
});
