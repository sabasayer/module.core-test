import { ICachableRequestConfig } from "@sabasayer/module.core";
import { TenantModel } from "./types/tenant-model.interface";

export const getTenantsRequestConfig: ICachableRequestConfig<
  undefined,
  TenantModel[] | undefined
> = {
  url: "getTenants",
  cacheKey: "tenant-model",
};
