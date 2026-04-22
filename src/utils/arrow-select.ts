import readline from 'node:readline';
import chalk from 'chalk';

export interface ArrowSelectOption {
  value: string;
  label: string;
}

export async function selectWithArrowKeys(
  title: string,
  options: ArrowSelectOption[],
): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY || options.length === 0) {
    return options[0]?.value ?? '';
  }

  readline.emitKeypressEvents(process.stdin);

  const stdin = process.stdin;
  const stdout = process.stdout;
  const canUseRawMode = typeof stdin.setRawMode === 'function';
  let activeIndex = 0;
  let renderedLineCount = 0;

  const render = () => {
    if (renderedLineCount > 0) {
      readline.moveCursor(stdout, 0, -renderedLineCount);
      readline.clearScreenDown(stdout);
    }

    const lines = [
      chalk.bold.white(`  ${title}`),
      chalk.dim('  Use the arrow keys, then press Enter.'),
      '',
      ...options.map((option, index) => {
        const marker = index === activeIndex ? chalk.cyan('>') : ' ';
        const text = index === activeIndex ? chalk.white(option.label) : chalk.dim(option.label);
        return `  ${marker} ${text}`;
      }),
      '',
    ];

    stdout.write(lines.join('\n'));
    renderedLineCount = lines.length;
  };

  return await new Promise<string>((resolve) => {
    const cleanup = () => {
      stdin.off('keypress', onKeypress);
      if (canUseRawMode) {
        stdin.setRawMode(false);
      }
    };

    const onKeypress = (_input: string, key: readline.Key) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        process.kill(process.pid, 'SIGINT');
        return;
      }

      if (key.name === 'up') {
        activeIndex = (activeIndex - 1 + options.length) % options.length;
        render();
        return;
      }

      if (key.name === 'down') {
        activeIndex = (activeIndex + 1) % options.length;
        render();
        return;
      }

      if (key.name === 'return') {
        const selected = options[activeIndex]?.value ?? '';
        cleanup();
        stdout.write('\n');
        resolve(selected);
      }
    };

    if (canUseRawMode) {
      stdin.setRawMode(true);
    }
    stdin.resume();
    stdin.on('keypress', onKeypress);
    render();
  });
}
