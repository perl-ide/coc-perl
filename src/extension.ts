'use strict';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import {
  workspace,
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  RevealOutputChannelOn,
} from 'coc.nvim';

export function activate(context: ExtensionContext): void {
  const config = workspace.getConfiguration('perl');
  if (!config.get('enable')) {
    console.log('extension "perl" is disabled');
    return;
  }

  console.log('extension "perl" is now active');

  const debug_adapter_port: string = config.get('debugAdapterPort') || '13603';
  const perlCmd: string = config.get('perlCmd') || 'perl';
  const logLevel: number = config.get('logLevel') || 0;
  const client_version = '2.1.0';
  const perlArgs: string[] = [
    '-MPerl::LanguageServer',
    '-e',
    'Perl::LanguageServer::run',
    '--',
    '--port',
    debug_adapter_port,
    '--log-level',
    logLevel.toString(),
    '--version',
    client_version,
  ];

  let sshPortOption = '-p';
  let sshCmd: string = config.get('sshCmd') || '';
  if (!sshCmd) {
    if (/^win/.test(process.platform)) {
      sshCmd = 'plink';
      sshPortOption = '-P';
    } else {
      sshCmd = 'ssh';
    }
  }
  const sshArgs: string[] = config.get('sshArgs') || [];
  const sshUser: string = config.get('sshUser') || '';
  const sshAddr: string = config.get('sshAddr') || '';
  const sshPort: string = config.get('sshPort') || '';

  let serverCmd: string;
  let serverArgs: string[];

  if (sshAddr && sshUser) {
    serverCmd = sshCmd;
    if (sshPort) {
      sshArgs.push(sshPortOption, sshPort);
    }
    sshArgs.push(
      '-l',
      sshUser,
      sshAddr,
      '-L',
      debug_adapter_port + ':127.0.0.1:' + debug_adapter_port,
      perlCmd
    );
    serverArgs = sshArgs.concat(perlArgs);
  } else {
    serverCmd = perlCmd;
    serverArgs = perlArgs;
  }

  console.log('cmd: ' + serverCmd + ' args: ' + serverArgs.join(' '));

  const debugArgs = serverArgs.concat(['--debug']);
  const serverOptions: ServerOptions = {
    run: { command: serverCmd, args: serverArgs },
    debug: { command: serverCmd, args: debugArgs },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: 'file', language: 'perl' }],
    revealOutputChannelOn: RevealOutputChannelOn.Never,
    synchronize: {
      // Synchronize the setting section 'perl_lang' to the server
      configurationSection: 'perl',
    },
  };

  // Create the language client and start the client.
  const disposable = new LanguageClient(
    'perl',
    'Perl Language Server',
    serverOptions,
    clientOptions
  ).start();

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(disposable);
}
