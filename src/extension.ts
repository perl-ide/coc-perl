'use strict';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as net from 'net';
import {
  workspace,
  ExtensionContext,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  RevealOutputChannelOn,
} from 'coc.nvim';

interface IPerlConfig {
  enable: boolean;

  perlCmd: string;
  perlArgs: string[];
  perlInc: string[];

  logFile: string;
  logLevel: number;

  debugAdapterPort: number;
  debugAdapterPortRange: number;

  sshCmd: string;
  sshArgs: string[];
  sshUser: string;
  sshAddr: string;
  sshPort: number;
}

// Default values for every extension config option.
// These values are merged with what's coming from user's configuration file
// in getConfig() function.
const defaultPerlConfig: IPerlConfig = {
  enable: true,
  perlCmd: 'perl',
  perlArgs: [],
  perlInc: [],
  logFile: '',
  logLevel: 0,
  debugAdapterPort: 13603,
  debugAdapterPortRange: 100,
  sshCmd: 'ssh',
  sshArgs: [],
  sshUser: '',
  sshAddr: '',
  sshPort: 0,
};

function getConfig(): IPerlConfig {
  const wsConfig = workspace.getConfiguration().get('perl') as IPerlConfig;
  // Merge both config from workspace and the default values, but prevent
  // explicit null and undefined values coming from the workspace
  // configuration to override the dafault values.
  const config = {
    ...defaultPerlConfig,
    ...Object.fromEntries(
      // eslint-disable-next-line
      Object.entries(wsConfig).filter(([_, v]) => v !== null && v !== undefined)
    ),
  };
  return config;
}

function checkPort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);

    server.listen({ host: '127.0.0.1', port: port }, () => {
      server.close(() => {
        resolve(port);
      });
    });
  });
}

async function getAvailablePort(
  port: number,
  port_range: number
): Promise<number> {
  for (let i = 0; i < port_range; i++) {
    try {
      console.log('try if port ' + (port + i) + ' is available');
      return await checkPort(port + i);
    } catch (error: unknown) {
      const errorCode = error as NodeJS.ErrnoException;
      if (errorCode.code === undefined) {
        throw error;
      } else {
        if (
          !['EADDRNOTAVAIL', 'EINVAL', 'EADDRINUSE'].includes(errorCode.code)
        ) {
          throw error;
        }
      }
    }
  }

  return port;
}

export async function activate(context: ExtensionContext) {
  const config = getConfig();
  if (!config.enable) {
    console.log('extension for Perl disabled');
    return;
  }

  const lsVersion = '2.4.0';
  const perlIncOpt = config.perlInc.map((incDir: string) => '-I' + incDir);
  // Even though the user might have chosen a fixed port, we must run
  // through the range in case it's already in use.
  const debugAdapterPort = await getAvailablePort(
    config.debugAdapterPort,
    config.debugAdapterPortRange
  );
  console.log('use ' + debugAdapterPort + ' as debug adapter port');

  const perlArgsOpt = [
    ...perlIncOpt,
    ...config.perlArgs,
    '-MPerl::LanguageServer',
    '-e',
    'Perl::LanguageServer::run',
    '--',
    '--port',
    debugAdapterPort.toString(),
    '--log-level',
    config.logLevel.toString(),
    '--log-file',
    config.logFile,
    '--version',
    lsVersion,
  ];

  let sshCmd = config.sshCmd;
  let sshPortOpt = '-p';
  if (/^win/.test(process.platform)) {
    sshCmd = 'plink';
    sshPortOpt = '-P';
  }

  let serverCmd: string;
  let serverArgs: string[] = [];
  if (config.sshAddr && config.sshUser) {
    serverCmd = sshCmd;
    if (config.sshPort) {
      serverArgs.push(sshPortOpt, config.sshPort.toString());
    }
    serverArgs.push(
      '-l',
      config.sshUser,
      config.sshAddr,
      '-L',
      config.debugAdapterPort + ':127.0.0.1:' + config.debugAdapterPort,
      config.perlCmd
    );
    serverArgs = serverArgs.concat(perlArgsOpt);
  } else {
    serverCmd = config.perlCmd;
    serverArgs = perlArgsOpt;
  }
  console.log('cmd: ' + serverCmd + ' args: ' + serverArgs.join(' '));

  const serverOptions: ServerOptions = {
    run: { command: serverCmd, args: serverArgs },
    debug: { command: serverCmd, args: serverArgs.concat(['--debug']) },
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
  const client = new LanguageClient(
    'perl',
    'Perl Language Server',
    serverOptions,
    clientOptions
  ).start();

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(client);
}
