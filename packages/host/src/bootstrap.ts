export const bootstrap = async () => {
  console.log("bootstrap");

  const authModule = (await import("auth/module")).authModule;
  console.log('module',authModule);
  authModule.bootstrap();
};

export const getAuthController = async () => {
  return (await import("auth/auth")).AuthController;
};
