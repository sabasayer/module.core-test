import { ModuleCore, SessionStorageCache } from "@sabasayer/module.core";
import { injectable, resolve } from "./decorators";

class AuthModule extends ModuleCore {}

const authModule = new AuthModule();

authModule.registerCache(SessionStorageCache);
authModule.useDecorators(injectable, resolve);

export { authModule };
