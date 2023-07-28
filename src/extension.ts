import { ExtensionContext, LanguageClient } from 'coc.nvim';

import { getConfig } from './config';
import { getPLSClient } from './p_ls';
import { getNavigatorClient } from './navigator';

export async function activate(context: ExtensionContext) {
  let client: LanguageClient;
  const config = getConfig();
  console.log(config);

  if (config.pls.enable === true && config.navigator.enable === true) {
    console.error('coc-perl activated, but more than one server enabled');
    return;
  } else if (config.pls.enable === false && config.navigator.enable === false) {
    console.error('coc-perl activated, but no server enabled');
    return;
  } else if (config.navigator.enable === true) {
    client = getNavigatorClient(config.navigator);
    console.log('server Perl Navigator enabled');
  } else {
    client = await getPLSClient(config.pls);
    console.log('server Perl::LanguageServer enabled');
  }

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(client.start());
}
