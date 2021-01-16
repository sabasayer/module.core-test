import { FetchHTTPClient, ModuleCore } from "@sabasayer/module.core";
import { authModule } from "auth/src/configurations/module";
import { fetchClient } from "./http-client.boot";
import { injectable, resolve } from "./decorators";

class CoreModule extends ModuleCore {
  private id = Math.random();
}

const coreModule = new CoreModule();

coreModule.useDecorators(resolve, injectable);

coreModule.registerHttpClientImplementation(fetchClient, FetchHTTPClient);
authModule.registerHttpClientImplementation(fetchClient, FetchHTTPClient);

export { coreModule };
