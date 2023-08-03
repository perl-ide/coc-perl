import fs from 'fs';
import path from 'path';
import util from 'util';
import which from 'which';
import { ExecOptions, exec } from 'child_process';
import { ExtensionContext, window, workspace } from 'coc.nvim';
import { SimpleGit, SimpleGitOptions, simpleGit } from 'simple-git';

import { INavigatorConfig } from './navigator';
import { IPLSConfig } from './p_ls';
import { withStatusBar } from './ui';

const asyncExec = util.promisify(exec);

type CmdResult = {
  err?: Error | null;
  stderr?: string;
  stdout?: string;
};

type InstallInfo = {
  installed: boolean;
  installPath?: string;
};

function gitSetup(cwd: string): SimpleGit {
  const opts: SimpleGitOptions = {
    baseDir: cwd,
    maxConcurrentProcesses: 6,
    trimmed: true,
    binary: 'git',
    config: [],
  };
  return simpleGit(opts);
}

async function runCommand(cmd: string, cwd?: string): Promise<CmdResult> {
  const opts: ExecOptions = {
    cwd: cwd || workspace.cwd,
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

function isNavigatorInstalled(
  context: ExtensionContext,
  config: INavigatorConfig
): InstallInfo {
  const info: InstallInfo = { installed: false };

  if (config.serverPath.length !== 0) {
    info.installed = true;
    return info;
  }

  const extPath = path.join(
    context.storagePath,
    'PerlNavigator',
    'server',
    'out'
  );
  // Check if the PerlNavigator was already cloned and installed
  if (fs.existsSync(extPath)) {
    info.installed = true;
    info.installPath = extPath;
    return info;
  }

  return info;
}

async function isPLSInstalled(config: IPLSConfig): Promise<InstallInfo> {
  let cmd = `perl -MPerl::LanguageServer -e 1`;
  if (config.perlInc.length > 0) {
    cmd = `perl -I${config.perlInc} -MPerl::LanguageServer -e 1`;
  }

  const info: InstallInfo = { installed: false };
  const result = await runCommand(cmd);
  if (result.err && result.err.message.includes("Can't locate")) {
    return info;
  } else if (result.err) {
    console.error(result.err.message);
    return info;
  }
  info.installed = true;
  return info;
}

export async function installPLS(
  config: IPLSConfig,
  version: string
): Promise<boolean> {
  const info = await isPLSInstalled(config);
  if (info.installed) return true;

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

      const result = await runCommand(
        `cpan GRICHTER/Perl-LanguageServer-${version}`
      );
      if (result.err) {
        console.error(result.err.message);
        window.showErrorMessage(`failed to install '${name}'`);
        return;
      }
      window.showInformationMessage(`'${name}' installed`);
      installed = true;
    });
  } catch (e) {
    console.error((e as Error).message);
    window.showErrorMessage((e as Error).message);
  }

  return installed;
}

export async function installNavigator(
  context: ExtensionContext,
  config: INavigatorConfig,
  version: string
): Promise<[boolean, INavigatorConfig]> {
  const info = isNavigatorInstalled(context, config);
  if (info.installed) {
    config.serverPath = info.installPath
      ? path.join(info.installPath, '/server.js')
      : config.serverPath;
    return [true, config];
  }

  const name = 'PerlNavigator';
  let installed = false;
  try {
    await withStatusBar(`Installing '${name}'...`, async () => {
      let cwd = context.storagePath;
      let isCloned = false;
      if (!fs.existsSync(cwd)) {
        fs.mkdirSync(cwd);
      } else {
        // Prevent running a clone if repo was alread cloned
        if (fs.existsSync(path.join(cwd, 'PerlNavigator'))) isCloned = true;
      }

      let git = gitSetup(cwd);
      if (!isCloned) {
        try {
          await git.clone('https://github.com/bscan/PerlNavigator.git');
        } catch (e) {
          console.error('failed to download source:', (e as Error).message);
          return;
        }
      }
      cwd = path.join(cwd, name);
      git = gitSetup(cwd);

      const tagRef = await git.raw('rev-list', '--tags', '--max-count=1');
      const latestTag = await git.raw('describe', '--tags', tagRef);
      version = 'v' + version;
      let tag = latestTag;
      if (latestTag !== version) {
        console.warn(`latest '${name}' version is not supported yet`);
        console.warn(`changing '${name}' to version ${version}`);
        tag = version;
      }
      try {
        await git.checkout(tag);
      } catch (e) {
        console.error('failed to get latest version:', (e as Error).message);
        window.showErrorMessage(`failed to install '${name}'`);
        return;
      }

      let result = await runCommand('npm ci', cwd);
      if (result.err) {
        console.error(result.err.message);
        console.error(result.stderr);
        window.showErrorMessage(`failed to install '${name}'`);
        return;
      }

      cwd = path.join(cwd, 'server');
      result = await runCommand('npm exec tsc', cwd);
      if (result.err) {
        console.error(result.err.message);
        console.error(result.stderr);
        window.showErrorMessage(`failed to install '${name}'`);
        return;
      }
      window.showInformationMessage(`'${name}' installed`);

      // Update server path based on the clonned repo.
      config.serverPath = path.join(cwd, 'out', 'server.js');
      installed = true;
    });
  } catch (e) {
    console.error((e as Error).message);
    window.showErrorMessage((e as Error).message);
  }

  return [installed, config];
}
