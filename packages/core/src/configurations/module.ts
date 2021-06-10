import { CoreModule } from "@sabasayer/module.core";
import { authModule } from "auth/src/configurations/module";
import { fetchClient } from "./http-client.boot";
import { injectable, resolve } from "./decorators";

class HomeModule extends CoreModule {
  private id = Math.random();
}

const coreModule = new HomeModule();

coreModule.useDecorators(resolve, injectable);

coreModule.registerHttpClientImplementation(fetchClient);
authModule.registerHttpClientImplementation(fetchClient);

export { coreModule };
