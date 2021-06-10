import { ICache, SessionStorageCache } from "@sabasayer/module.core";
import { BaseProvider } from "core/src/response/base.provider";
import { injectable, resolve } from "../configurations/decorators";
import { getTenantsRequestConfig } from "./tenants.config";

@injectable.provider()
export class TenantProvider extends BaseProvider {
  @resolve.cache(SessionStorageCache)
  declare cache: ICache;

  protected baseUrl = "core";

  async getTenants() {
    return this.cachablePost(getTenantsRequestConfig, {});
  }
}
