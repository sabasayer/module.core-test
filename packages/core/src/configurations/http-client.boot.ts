import { FetchHTTPClient } from "@sabasayer/module.core";

type ApiErrorMessage = { key: string; value: string };

const createErrorFn = async (response) => {
  const res = await response.json();
  const messages: ApiErrorMessage[] | undefined = res.data.messages;

  const errorMessage = messages
    ?.map((e) => `${e.key} : ${e.value}`) 
    .join(", ");

  return new Error(errorMessage);
};

export const fetchClient = new FetchHTTPClient({
  hostName: "api.comed.com.tr",
  languagePrefix: "tr-tr",
  prefix: "api/json",
  headers: {
    "x-application-key": "/uq+fiM1AzYe7bHAJCixzg==",
    "content-type": "application/json",
  },
  createErrorFn,
});
