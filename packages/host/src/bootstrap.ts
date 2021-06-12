const authModulePromise = import("auth/module");
const authPromise = import("auth/auth");

export const getModule = async () => (await authModulePromise).authModule;

export const bootstrap = async () => {
  const authModule = await getModule();
  authModule.bootstrap();
};

export const getAuthController = async () => {
  const module = await getModule();
  const controller = (await authPromise).AuthController;

  return module.resolveController(controller);
};
