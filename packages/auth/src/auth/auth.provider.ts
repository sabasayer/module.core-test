import { injectable } from "../configurations/decorators";
import { BaseProvider } from "core/src/response/base.provider";
import { signInRequestConfig, signOutRequestConfig } from "./auth.config";
import { SignInRequest } from "./types/sign-in.request";
import { SignOutRequest } from "./types/sign-out.request";

@injectable.provider()
export class AuthProvider extends BaseProvider {
  protected baseUrl = "core/auth";

  signIn(request: SignInRequest) {
    return this.post(signInRequestConfig, request);
  }

  signOut(request: SignOutRequest) {
    return this.post(signOutRequestConfig, request);
  }
}
