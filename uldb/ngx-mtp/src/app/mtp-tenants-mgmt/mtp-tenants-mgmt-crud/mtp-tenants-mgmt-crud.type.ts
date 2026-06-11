export interface AddTenantDataType {
    name: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    domain: string;
    unity_modules: number[];
    region: number;
    _logo: string;
    email: string;
    uuid: string;
  }
  
  export interface UnityModulesDataType {
    module_name: string;
    module_id: string;
  }
  
  export interface TenantGroupDataType {
    name: string;
    uuid: string;
  }