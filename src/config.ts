import { workspace } from 'coc.nvim';

import { IPLSClientConfig } from './p_ls';
import { INavigatorClientConfig } from './navigator';

/* Only hold values that are required by the client to start the server, other
* than that, let coc.nvim handle the configuration options transmission. */
export interface IClientConfig {
  navigator: INavigatorClientConfig | any;
  pls: IPLSClientConfig | any;
}

export function getConfig(): IClientConfig {
  const navConfig = workspace.getConfiguration('perlnavigator');
  const plsConfig = workspace.getConfiguration('perl');

  const config: IClientConfig = {
    navigator: {
      enable: navConfig.get('enable') as boolean,
      serverPath: navConfig.get('serverPath') as string,
    },
    pls: plsConfig,
  };
  return config;
}
