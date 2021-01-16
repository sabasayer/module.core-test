export interface SignInResponseModel {
  identity: any;
  credential: any;
  token: string;
  tenantId: number;
  version: string;
  serverDate: string;
}
