import { CoreModule } from "@sabasayer/module.core";
import { fetchClient } from "./http-client.boot";
import { injectable, resolve } from "./decorators";
import { authModule } from "auth/src/configurations/module";

class HomeModule extends CoreModule {
  private id = Math.random();
}

const coreModule = new HomeModule();

coreModule.useDecorators(resolve, injectable);
coreModule.registerHttpClientImplementation(fetchClient);
authModule.bootstrap();

export { coreModule };
