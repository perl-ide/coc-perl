import { getConfig, getClient } from './pls';
import { services, ExtensionContext, LanguageClient } from 'coc.nvim';

export async function activate(context: ExtensionContext) {
  if (getConfig().enable === false) {
    return;
  }

  const client: LanguageClient = await getClient();
  client.start();

  // Push the disposable to the context's subscriptions so that the
  // client can be deactivated on extension deactivation
  context.subscriptions.push(services.registLanguageClient(client));
}
