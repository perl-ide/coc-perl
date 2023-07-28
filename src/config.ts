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

import { workspace } from 'coc.nvim';

import { IPLSConfig } from './p_ls';
import { INavigatorConfig } from './navigator';

/* The default option property for Perl::LanguageServer is 'perl.*', which,
 * unfortunatelly colides with the format chosen for coc-perl, thus when
 * retrieving all 'perl.*' configuration options, 'perl.navigator' and
 * 'perl.p::ls' will also be retrieved. With that, we extends the original
 * IPLSConfig interface, which contains what's actually required by
 * Perl::LanguageServer under 'perl.*', with the unwanted options as
 * optional so we can delete them later on. */
interface ICompatPLSConfig extends IPLSConfig {
  navigator?: INavigatorConfig;
  'p::ls'?: IPLSConfig;
}

export interface IPerlConfig {
  navigator: INavigatorConfig;
  pls: IPLSConfig;
}

/* Handle mixed configuration: original (compat) VSCode options and coc-perl
 * format; and place them in the standard IPerlConfig interface.
 * Options using coc-perl format will have precedence over others. */
export function getConfig(): IPerlConfig {
  const compatNavConfig = workspace
    .getConfiguration()
    .get('perlnavigator') as INavigatorConfig;
  const newNavConfig = workspace
    .getConfiguration()
    .get('perl.navigator') as INavigatorConfig;
  // Spread both in the same object, overriding compat options.
  const navConfig = { ...compatNavConfig, ...newNavConfig };

  // Retrieve 'perl.*' and ignore unwanted options.
  // See more on comment for ICompatPLSConfig.
  const {
    navigator: _,
    'p::ls': __,
    ...compatPLSConfig
  } = workspace.getConfiguration().get('perl') as ICompatPLSConfig;

  const newPLSConfig = workspace
    .getConfiguration()
    .get('perl.p::ls') as IPLSConfig;
  const plsConfig = { ...compatPLSConfig, ...newPLSConfig };

  const config: IPerlConfig = {
    navigator: navConfig,
    pls: plsConfig,
  };
  return config;
}
