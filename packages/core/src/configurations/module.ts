import { FetchHTTPClient, ModuleCore } from "@sabasayer/module.core";
import { authModule } from "../../../auth/src/configurations/module";
import { coreLogger } from "./logger";
import { fetchClient } from "./http-client.boot";
import { injectable, resolve } from "auth/src/configurations/decorators";

class CoreModule extends ModuleCore {}

const coreModule = new CoreModule();

coreModule.registerHttpClientImplementation(fetchClient, FetchHTTPClient);
authModule.registerHttpClientImplementation(fetchClient, FetchHTTPClient);

coreModule.useDecorators(resolve, injectable);

coreLogger.log("auth module", authModule);

export { coreModule };
