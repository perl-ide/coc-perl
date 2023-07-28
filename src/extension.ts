import { IPLSConfig, getPLSClient } from './p_ls';
import { INavigatorConfig, getNavigatorClient } from './navigator';
import { workspace, ExtensionContext, LanguageClient } from 'coc.nvim';

interface IPerlConfig {
  navigator: INavigatorConfig;
  pls: IPLSConfig;
}

export async function activate(context: ExtensionContext) {
  let client: LanguageClient;
  const config: IPerlConfig = {
    navigator: workspace
      .getConfiguration()
      .get('perl.navigator') as INavigatorConfig,
    pls: workspace.getConfiguration().get('perl.p::ls') as IPLSConfig,
  };

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
