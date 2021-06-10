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

authModule.useDecorators(injectable, resolve);
authModule.registerCache(SessionStorageCache);

export const fetchClient = new FetchHTTPClient({
  hostName: "api.comed.com.tr",
  languagePrefix: "tr-tr",
  prefix: "api/json",
  headers: {
    "x-application-key": "/uq+fiM1AzYe7bHAJCixzg==",
    "content-type": "application/json",
  },
});

authModule.registerHttpClient(FetchHTTPClient, {
  hostName: "api.comed.com.tr",
  languagePrefix: "tr-tr",
  prefix: "api/json",
  headers: {
    "x-application-key": "/uq+fiM1AzYe7bHAJCixzg==",
    "content-type": "application/json",
  },
});

export { authModule };
