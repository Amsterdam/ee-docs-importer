import { app } from './importer';

const { mockedCloneAndCheckout } = vi.hoisted(() => {
  return {
    mockedCloneAndCheckout: vi.fn().mockReturnValue(Promise.resolve()),
  };
});

vi.mock('./git/cloneAndCheckout', () => ({
  __esModule: true,
  default: mockedCloneAndCheckout,
}));

vi.mock('./processDocumentDirectories', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue({}),
}));

// Avoid outputting unnecessary console.logs
vi.mock('./output');

describe('importer', () => {
  it('calls cloneAndCheckout with the correct URL and directories', async () => {
    await app('docs');
    // These values would be wiser as environment variables but we only
    // reference them in 2 places: here and in `importer.ts`, so this saves
    // modifying the esbuild command and creating an .env file
    expect(mockedCloneAndCheckout).toHaveBeenCalledWith(
      'git@github.com:Amsterdam/development-standards.git',
      'docs/latest',
      'feature/md-validation'
    );
  });
});
