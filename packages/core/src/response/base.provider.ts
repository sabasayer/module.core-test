import {
  CoreProvider,
  ProviderRequestOptions,
  IRequestConfig,
} from "@sabasayer/module.core";
import { ResponseModel } from "./response-model.interface";

export class BaseProvider extends CoreProvider {
  async post<TRequest, TResponse>(
    config: IRequestConfig<TRequest, TResponse>,
    request: TRequest,
    options?: ProviderRequestOptions
  ): Promise<TResponse | undefined> {
    const response = await super.post<TRequest, TResponse>(
      config,
      request,
      options
    );

    return (response as any as ResponseModel<TResponse>).data;
  }
}
