/* AUTHOR NOTES
 *
 * This extension code was slightly changed from the original version, which
 * can be retrieved from PerlNavigator GitHub repository, to fit coc.nvim
 * requirements and API. The differences will be maintained by coc-perl's
 * author on demand, since the original extension code was done specifically
 * to VSCode.
 *
 * Bruno Meneguele <bmeneg@heredoc.io>
 */

/* ORIGINAL LICENSE
 *
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'coc.nvim';

export interface INavigatorClientConfig {
  enable: boolean;
  serverPath: string;
}

export function getNavigatorClient(serverPath: string): LanguageClient {
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // If the extension is launched in debug mode then the debug server
  // options are used Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: {
      module: serverPath,
      transport: TransportKind.ipc,
    },
    debug: {
      module: serverPath,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [
      { scheme: 'file', language: 'perl' },
      { scheme: 'untitled', language: 'perl' },
    ],
  };

  const client = new LanguageClient(
    'PerlNavigator',
    'Perl Language Server',
    serverOptions,
    clientOptions
  );
  return client;
}
