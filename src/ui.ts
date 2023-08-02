import { window } from 'coc.nvim';

export async function withStatusBar(text: string, fn: () => Promise<void>) {
  const status = window.createStatusBarItem(90, { progress: true });

  status.text = text;
  status.show();

  await fn();

  status.dispose();
}
