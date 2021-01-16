import { IController } from "@sabasayer/module.core";
import { injectable } from "../configurations/decorators";
import { TenantProvider } from "./tenant.provider";

@injectable.controller({ provider: TenantProvider })
export class TenantController implements IController {
  constructor(private provider: TenantProvider) {}

  async get() {
    return this.provider.getTenants();
  }
}
