import {
  globalModule,
  IController,
  IHTTPClient,
  SessionStorageCache,
} from "@sabasayer/module.core";
import { AuthProvider } from "./auth.provider";
import { SignInResponseModel } from "./types/sign-in-response-model.interface";
import { SignInRequest } from "./types/sign-in.request";
import { authModule } from "../configurations/module";
import { injectable } from "../configurations/decorators";

@injectable.controller({ provider: AuthProvider })
export class AuthController implements IController {
  cache?: SessionStorageCache = authModule.resolveCache(SessionStorageCache);
  httpClient?: IHTTPClient = authModule.resolveHttpClient();

  readonly cacheKey = "signInResponse";
  readonly authHeaderKey = "x-authentication-token";

  private id = Math.random();

  constructor(private provider?: AuthProvider) {
    console.log("constructor => this.cache", this);
    this.initTokenFromCache();
  }

  private get response() {
    return this.cache.get<SignInResponseModel>(this.cacheKey);
  }

  get currentUser() {
    return this.response.credential;
  }

  async signIn(request: SignInRequest) {
    const response = await this.provider.signIn(request);
    this.useResponse(response);
    return response;
  }

  async signOut() {
    const token = this.response?.token;
    if (!token) return;

    const response = await this.provider.signOut({ token });
    if (!response) throw new Error("Sign out failed");

    this.removeCache();
    this.removeAuthToken();
  }

  private useResponse(response: SignInResponseModel) {
    this.cacheResponse(response);
    this.setAuthToken(response.token);
  }

  private cacheResponse(response: SignInResponseModel) {
    this.cache.set(this.cacheKey, response);
  }

  private initTokenFromCache() {
    const response = this.response;
    if (!response) return;

    this.setAuthToken(response.token);
  }

  private setAuthToken(token: string) {
    this.httpClient.setHeader(this.authHeaderKey, token);
    globalModule.addToSharedHeaders({ [this.authHeaderKey]: token });
  }

  private removeCache() {
    this.cache.remove(this.cacheKey);
  }

  private removeAuthToken() {
    this.httpClient.setHeader(this.authHeaderKey, "");
    globalModule.removeSharedHeaders(this.authHeaderKey);
  }
}
