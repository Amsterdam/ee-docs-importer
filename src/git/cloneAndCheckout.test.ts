import { expect, it, describe, vi } from 'vitest';
import cloneAndCheckout from './cloneAndCheckout';

const { cloneMock } = vi.hoisted(() => {
  return {
    cloneMock: vi.fn().mockResolvedValue({
      cwd: vi.fn().mockReturnThis(),
    }),
  };
});

const { checkoutMock } = vi.hoisted(() => {
  return { checkoutMock: vi.fn().mockReturnValue(Promise.resolve()) };
});

vi.mock('simple-git', async importOriginal => {
  const mockGit = {
    clean: vi.fn().mockReturnThis(),
    clone: cloneMock,
    cwd: vi.fn().mockReturnThis(),
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
  it('clones the requested repo into the correct directory', async () => {
    await cloneAndCheckout(
      'git@github.com:Amsterdam/development-standards.git',
      'docs/local',
      'feature/foobar'
    );

    expect(cloneMock).toHaveBeenCalledWith(
      'git@github.com:Amsterdam/development-standards.git',
      'docs/local'
    );
  });

  it('checkouts if the branch is other than main', async () => {
    await cloneAndCheckout(
      'git@github.com:Amsterdam/development-standards.git',
      'docs/local',
      'feature/foobar'
    );

    expect(checkoutMock).toHaveBeenCalledWith('feature/foobar');
  });
});
