import { IRequestConfig } from "@sabasayer/module.core";
import { SignInResponseModel } from "./types/sign-in-response-model.interface";
import { SignInRequest } from "./types/sign-in.request";
import { SignOutRequest } from "./types/sign-out.request";

export const signInRequestConfig: IRequestConfig<
  SignInRequest,
  SignInResponseModel
> = {
  url: "signIn",
};

export const signOutRequestConfig: IRequestConfig<SignOutRequest, string> = {
  url: "signOut",
};
