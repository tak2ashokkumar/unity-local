export interface ManageReportDatacenterDeviceType {
  type: string;
  data: ManageReportDatacenterDeviceDataType[];
}

export interface ManageReportDatacenterDeviceDataType {
  tags: string[];
  co2_emitted: number;
  cabinet: string;
  power_consumed: number;
  data_center: string;
  ip_address: string;
  uptime: string;
  name: string;
  region: string;
  model: string;
  type: string;
}

export interface ManageReportSustainabilityAwsType {
  type: string;
  data: ManageReportAwsCo2EmissionDataType;
  total_emission: number;
  total_accounts: number;
  highest_carbon_emission_by_service: string;
  highest_carbon_emission_by_geography: string;
}

export interface ManageReportAwsCo2EmissionDataType {
  [key:string]: ManageReportAwsDataType;
}

export interface ManageReportAwsDataType {
  [key: string]: number;
}

export interface ManageReportSustainabilityGcpType {
  type: string;
  data: ManageReportGcpCo2EmissionDataType;
  total_emission: number;
  total_products: number;
  total_projects: number;
  highest_carbon_emission_by_product: string;
}

export interface ManageReportGcpCo2EmissionDataType {
  [key:string]: ManageReportGcpDataType;
}

export interface ManageReportGcpDataType {
  [key: string]: number;
}