/* This is a thin backwards-compatibility layer for handling extension
 * configuration options from server's original format to coc-perl format.
 * As of today, coc-perl supports Perl::LanguageServer and PerlNavigator
 * servers, which don't have coliding options, however, their naming might
 * get confusing with future versions of coc-perl, where "generic" options
 * (valid for both servers) can get added. With this layer, the user can use
 * their VSCode settings as-is, for both servers, or change to the
 * "standard" coc-perl format.
 *
 * Bruno Meneguele <bmeneg@heredoc.io>
 */

import { workspace, WorkspaceConfiguration } from 'coc.nvim';

import { IPLSConfig } from './p_ls';
import { INavigatorClientConfig } from './navigator';

/* The default option property for Perl::LanguageServer is 'perl.*', which,
 * unfortunatelly colides with the format chosen for coc-perl, thus when
 * retrieving all 'perl.*' configuration options, 'perl.navigator' and
 * 'perl.p::ls' will also be retrieved. With that, we extends the original
 * IPLSConfig interface, which contains what's actually required by
 * Perl::LanguageServer under 'perl.*', with the unwanted options as
 * optional so we can delete them later on. */
interface ICompatPLSConfig extends IPLSConfig {
  navigator?: INavigatorClientConfig;
  'p::ls'?: IPLSConfig;
}

/* PerlNavigator requires working with `workpace/configuration` pull method,
 * instead of the "old" synchronize config sections as PerlLanguageServer,
 * thus splitting the config option that is specific to the client and
 * server seems appropriate. */
export interface IPerlConfig {
  navigatorClient: INavigatorClientConfig;
  navigatorServer: WorkspaceConfiguration;
  pls: IPLSConfig;
}

/* Handle mixed configuration: original (compat) VSCode options and coc-perl
 * format; and place them in the standard IPerlConfig interface by merging the
 * values into a single namespace[1]. Options using coc-perl format have
 * precedence over the original format.
 *
 * [1] by "namespace" I mean eg. `perlnavigator` vs `perl.navigator`, where
 * each is a different namespace. */
export function getConfig(): IPerlConfig {
  // To avoid multiple reruns, use bitwise 'or' in a number flag to notify an
  // update occured in the middle of the forEach() iteration.
  let didConfigChange: number;
  let origConfig: WorkspaceConfiguration;

  let cocNavConfig: WorkspaceConfiguration;
  do {
    didConfigChange = 0;
    origConfig = workspace.getConfiguration('perlnavigator');
    cocNavConfig = workspace.getConfiguration('perl.navigator');
    Object.entries(cocNavConfig).forEach(([k, v]) => {
      const origOpt = origConfig.inspect(k);
      const cocOpt = cocNavConfig.inspect(k);
      let value;
      if (
        // Only change that values that ware actually manually set and are
        // different on each namespace.
        origOpt?.workspaceValue !== undefined &&
        origOpt?.workspaceValue !== cocOpt?.workspaceValue
      ) {
        value =
          cocOpt?.workspaceValue === undefined ? origOpt?.workspaceValue : v;
        cocNavConfig.update(k, value);
        didConfigChange |= 1;
      } else if (
        origOpt?.globalValue !== undefined &&
        origOpt?.globalValue !== cocOpt?.globalValue
      ) {
        value = cocOpt?.globalValue === undefined ? origOpt?.globalValue : v;
        cocNavConfig.update(k, value, true);
        didConfigChange |= 1;
      }
    });
  } while (didConfigChange);

  const navServerConfig = cocNavConfig;
  const navClientConfig: INavigatorClientConfig = {
    enable: cocNavConfig.get('enable') as boolean,
    serverPath: cocNavConfig.get('serverPath') as string,
  };

  // Retrieve 'perl.*' and ignore unwanted options.
  // See more on comment for ICompatPLSConfig.
  let cocPLSConfig: WorkspaceConfiguration;
  do {
    didConfigChange = 0;
    origConfig = workspace.getConfiguration('perl');
    cocPLSConfig = workspace.getConfiguration('perl.p::ls');
    Object.entries(cocPLSConfig).forEach(([k, v]) => {
      const origOpt = origConfig.inspect(k);
      const cocOpt = cocPLSConfig.inspect(k);
      let value;
      if (
        origOpt?.workspaceValue !== undefined &&
        origOpt?.workspaceValue !== cocOpt?.workspaceValue
      ) {
        value =
          cocOpt?.workspaceValue === undefined ? origOpt?.workspaceValue : v;
        cocPLSConfig.update(k, value);
        didConfigChange |= 1;
      } else if (
        origOpt?.globalValue !== undefined &&
        origOpt?.globalValue !== cocOpt?.globalValue
      ) {
        value = cocOpt?.globalValue === undefined ? origOpt?.globalValue : v;
        cocPLSConfig.update(k, value, true);
        didConfigChange |= 1;
      }
    });
  } while (didConfigChange);

  const {
    navigator: _, // perl.navigator
    'p::ls': __, // perl.p::ls
    ...plsConfig // perl.*
  } = cocPLSConfig as unknown as ICompatPLSConfig;

  const config: IPerlConfig = {
    navigatorClient: navClientConfig,
    navigatorServer: navServerConfig,
    pls: plsConfig,
  };
  return config;
}
