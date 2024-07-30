import { afterAll, describe, expect, it, vi } from 'vitest';
import output from './output';

describe('output', () => {
  const consoleLogMock = vi
    .spyOn(console, 'log')
    .mockImplementation(() => undefined);
  const consoleErrorMock = vi
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  afterAll(() => {
    consoleErrorMock.mockReset();
  });

  it('displays the default logs', () => {
    output({});

    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenLastCalledWith(
      '\x1b[36m',
      '✅ Docs imported!',
      '\x1b[0m'
    );
    expect(consoleErrorMock).toHaveBeenCalledTimes(0);
  });

  it('displays errrors if provided', () => {
    const errors = {
      'dir/foobar': 'Lorem ipsum odor amet, consectetuer adipiscing elit.',
      'dir/foobar2':
        'Etiam iaculis finibus lorem tempus facilisi feugiat pharetra tempor.',
    };
    output(errors);

    expect(consoleErrorMock).toHaveBeenCalledTimes(3);
    expect(consoleErrorMock).toHaveBeenLastCalledWith(errors['dir/foobar2']);
  });
});
