import {
  ICachableRequestConfig,
  IRequestConfig,
} from "@sabasayer/module.core/dist/provider/types/request-config.interface";
import { TenantModel } from "./types/tenant-model.interface";

export const getTenantsRequestConfig: ICachableRequestConfig<
  undefined,
  TenantModel[] | undefined
> = {
  url: "getTenants",
  cacheKey: "tenant-model",
};
