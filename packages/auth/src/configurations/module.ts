import {
  CoreModule,
  FetchHTTPClient,
  SessionStorageCache,
} from "@sabasayer/module.core";
import { injectable, resolve } from "./decorators";

class AuthModule extends CoreModule {
  private id = Math.random();
}

const authModule = new AuthModule();

authModule.registerCache(SessionStorageCache);
authModule.registerHttpClient(FetchHTTPClient, {
  hostName: "api.comed.com.tr",
  languagePrefix: "tr-tr",
  prefix: "api/json",
  headers: {
    "x-application-key": "/uq+fiM1AzYe7bHAJCixzg==",
    "content-type": "application/json",
  },
});

authModule.useDecorators(injectable, resolve);

export { authModule };
