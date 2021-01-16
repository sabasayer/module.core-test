import { EnumTenantType } from "../statics/tenant-type.enum";

export interface TenantModel {
  id: number;
  parent?: TenantModel;
  parentId: number;
  type: EnumTenantType;
  name: string;
  applicationKey: string;
}
