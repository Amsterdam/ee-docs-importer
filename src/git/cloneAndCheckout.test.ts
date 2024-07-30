import { expect, it, describe, vi } from 'vitest';
import cloneAndCheckout from './cloneAndCheckout';

const { checkoutMock } = vi.hoisted(() => {
  return { checkoutMock: vi.fn() };
});

vi.mock('simple-git', async importOriginal => {
  const mockGit = {
    clean: vi.fn().mockReturnThis(),
    clone: vi.fn().mockResolvedValue({
      cwd: vi.fn().mockReturnThis(),
    }),
    cwd: vi.fn().mockReturnThis(),
    // checkout: vi.fn(),
    checkout: checkoutMock,
  };

  mockGit.clone.mockImplementation(() => {
    return {
      cwd: mockGit.cwd,
    };
  });
  const original = importOriginal<typeof import('simple-git')>();
  return {
    ...original,
    simpleGit: () => mockGit,
    CleanOptions: {
      DRY_RUN: 'n',
    },
  };
});

describe('cloneAndCheckout', () => {
  it('foobar', async () => {
    await cloneAndCheckout(
      'git@github.com:Amsterdam/development-standards.git',
      'feature/foobar'
    );

    expect(checkoutMock).toHaveBeenCalled();
    expect(checkoutMock).toHaveBeenCalledWith('feature/foobar');
  });
});
