import {
  CoreProvider,
  ProviderRequestOptions,
  IRequestConfig,
} from "@sabasayer/module.core";
import { ResponseModel } from "./response-model.interface";

export class BaseProvider extends CoreProvider {
  async post<Request, Response>(
    config: IRequestConfig<Request, Response>,
    request: Request,
    options?: ProviderRequestOptions
  ): Promise<Response | undefined> {
    const response = await super.post<Request, ResponseModel<Response>>(
      config,
      request,
      options
    );

    return response.data;
  }
}
