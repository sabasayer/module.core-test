import "./configurations";

import { AuthController } from "auth/src/auth/auth.controller";
import { authModule } from "auth/src/configurations/module";
import { TenantController } from "auth/src/tenant/tenant.controller";

document.body.innerHTML = "Hello";

const main = async () => {

  const controller: AuthController = authModule.resolveController(
    AuthController
  );

  const tenantController: TenantController = authModule.resolveController(
    TenantController
  );

  const res = await controller.signIn({
    username: "ahmetar",
    password: "123456",
    tenantId: 1,
  });

  document.body.innerHTML = res?.token;

  await controller.signOut();

  const tenantRes = await tenantController.get();
};

main();
