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

/* MUST READ! THIS IS CONFUSING!
 *
 * Handle mixed configuration: original (compat) VSCode options and coc-perl
 * format; and place them in the standard IPerlConfig interface by merging the
 * values into a single namespace[1]. Options using coc-perl format have
 * precedence over the original format, however one important thing to note:
 * when passing the information to the server, we need to pass it in the
 * 'perlnavigator' namespace, because that's the section requested, thus we
 * need to aggregate the final configuration in the original namespace.
 *
 * [1] by "namespace" I mean eg. `perlnavigator` vs `perl.navigator`, where
 * each is a different namespace. */
export function getConfig(): IPerlConfig {
  // To avoid multiple reruns, use bitwise 'or' in a number flag to notify an
  // update occured in the middle of the forEach() iteration.
  let origConfig = workspace.getConfiguration('perlnavigator');
  const cocNavConfig = workspace.getConfiguration('perl.navigator');

  Object.entries(cocNavConfig).forEach(([k, v]) => {
    // v = currently defined value, workspace or default value
    const origOpt = origConfig.inspect(k);
    const cocOpt = cocNavConfig.inspect(k);
    let value;
    if (
      // Only change that values that were manually set and are different
      // on each namespace.
      cocOpt?.workspaceValue !== undefined &&
      cocOpt?.workspaceValue !== origOpt?.workspaceValue
    ) {
      value =
        origOpt?.workspaceValue === undefined ? cocOpt?.workspaceValue : v;
      origConfig.update(k, value);
    } else if (
      cocOpt?.globalValue !== undefined &&
      cocOpt?.globalValue !== origOpt?.globalValue
    ) {
      value = origOpt?.globalValue === undefined ? cocOpt?.globalValue : v;
      origConfig.update(k, value);
    }
  });

  const navClientConfig: INavigatorClientConfig = {
    enable: cocNavConfig.get('enable') as boolean,
    serverPath: cocNavConfig.get('serverPath') as string,
  };
  // Delete unwanted server-side configuration
  const { enable, serverPath, ...navServerConfig } = origConfig;

  // Retrieve 'perl.*' and ignore unwanted options.
  // See more on comment for ICompatPLSConfig.
  let cocPLSConfig: WorkspaceConfiguration;
  origConfig = workspace.getConfiguration('perl');
  cocPLSConfig = workspace.getConfiguration('perl.p::ls');
  Object.entries(cocPLSConfig).forEach(([k, v]) => {
    const origOpt = origConfig.inspect(k);
    const cocOpt = cocPLSConfig.inspect(k);
    let value;
    if (
      cocOpt?.workspaceValue !== undefined &&
      cocOpt?.workspaceValue !== origOpt?.workspaceValue
    ) {
      value =
        origOpt?.workspaceValue === undefined ? cocOpt?.workspaceValue : v;
      origConfig.update(k, value);
    } else if (
      cocOpt?.globalValue !== undefined &&
      cocOpt?.globalValue !== origOpt?.globalValue
    ) {
      value = origOpt?.globalValue === undefined ? cocOpt?.globalValue : v;
      origConfig.update(k, value);
    }
  });

  const {
    navigator, // perl.navigator
    'p::ls': _, // perl.p::ls
    ...plsConfig // perl.*
  } = cocPLSConfig as unknown as ICompatPLSConfig;

  const config: IPerlConfig = {
    navigatorClient: navClientConfig,
    navigatorServer: navServerConfig,
    pls: plsConfig,
  };
  return config;
}
