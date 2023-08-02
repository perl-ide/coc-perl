import util from 'util';
import which from 'which';
import { ExecOptions, exec } from 'child_process';
import { window, workspace } from 'coc.nvim';

import { INavigatorConfig } from './navigator';
import { IPLSConfig } from './p_ls';
import { withStatusBar } from './ui';

const asyncExec = util.promisify(exec);

type CmdResult = {
  err?: Error | null;
  stderr?: string;
  stdout?: string;
};

async function runCommand(cmd: string): Promise<CmdResult> {
  const opts: ExecOptions = {
    cwd: workspace.cwd,
    env: process.env,
    shell: process.platform === 'win32' ? undefined : process.env.SHELL,
  };

  const result: CmdResult = {};
  try {
    const { stdout, stderr } = await asyncExec(cmd, opts);
    result.stderr = stderr;
    result.stdout = stdout;
  } catch (e) {
    result.err = e as Error;
  }
  return result;
}

function isNavigatorInstalled(config: INavigatorConfig): boolean {
  return config.serverPath.length !== 0;
}

async function isPLSInstalled(config: IPLSConfig): Promise<boolean> {
  let cmd = `perl -MPerl::LanguageServer -e 1`;
  if (config.perlInc.length > 0) {
    cmd = `perl -I${config.perlInc} -MPerl::LanguageServer -e 1`;
  }

  const result = await runCommand(cmd);
  if (result.err && result.err.message.includes("Can't locate")) {
    return false;
  } else if (result.err) {
    console.error(result.err.message);
    return false;
  }
  return true;
}

export async function installPLS(config: IPLSConfig): Promise<boolean> {
  if (await isPLSInstalled(config)) return true;

  const name = 'Perl::LanguageServer';
  let installed = false;
  try {
    await withStatusBar(`Installing ${name}...`, async () => {
      const isCPANInstalled = Boolean(await which('cpan', { nothrow: true }));
      if (!isCPANInstalled) {
        const errMsg =
          'CPAN is not installed, impossible to install Perl::LanguageServer';
        console.error(errMsg);
        return;
      }

      const result = await runCommand(`cpan ${name}`);
      if (result.err) {
        console.error(result.err.message);
        window.showErrorMessage(`failed to install '${name}'`);
        return;
      }
      window.showInformationMessage(`'${name}' installed`);
      installed = true;
    });
  } catch (e) {
    window.showErrorMessage((e as Error).message);
  }
  return installed;
}

export async function installNavigator(
  config: INavigatorConfig
): Promise<boolean> {
  if (isNavigatorInstalled(config)) return true;

  return true;
}
