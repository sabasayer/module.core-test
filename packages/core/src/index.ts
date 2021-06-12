import "./configurations";

import { authModule } from "auth/src/configurations/module";
import { AuthController } from "auth/src/auth/auth.controller";
import { TenantController } from "auth/src/tenant/tenant.controller";

document.body.innerHTML = "Hello";

const main = async () => {
  const controller: AuthController =
    authModule.resolveController(AuthController);

  const tenantController: TenantController =
    authModule.resolveController(TenantController);

  console.log("controller", controller);

  const res = await controller.signIn({
    username: "ahmetar",
    password: "1",
    tenantId: 1,
  });

  document.body.innerHTML = res?.token;

  await controller.signOut();

  const tenantRes = await tenantController.get();
};

main();
