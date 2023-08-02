import { ExtensionContext, LanguageClient } from 'coc.nvim';

import { getConfig } from './config';
import { getPLSClient } from './p_ls';
import { getNavigatorClient } from './navigator';
import { installNavigator, installPLS } from './installer';

export async function activate(context: ExtensionContext) {
  let client: LanguageClient;
  const config = getConfig();

  if (config.pls.enable === true && config.navigator.enable === true) {
    console.error('coc-perl activated, but more than one server enabled');
    return;
  } else if (config.pls.enable === false && config.navigator.enable === false) {
    console.error('coc-perl activated, but no server enabled');
    return;
  } else if (config.navigator.enable === true) {
    const installed = await installNavigator(config.navigator);
    if (!installed) return;
    client = getNavigatorClient(config.navigator);
    console.log('server Perl Navigator enabled');
  } else {
    const installed = await installPLS(config.pls);
    if (!installed) return;
    client = await getPLSClient(config.pls);
    console.log('server Perl::LanguageServer enabled');
  }

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(client.start());
}
