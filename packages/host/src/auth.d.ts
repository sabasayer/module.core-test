declare module "auth/module" {
  const authModule: any;

  export { authModule };
}

declare module "auth/auth" {
  const AuthController: any, AuthProvider: any;

  export { AuthController, AuthProvider };
}
