import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';

/**
 * Provides API access, form construction, and data mapping helpers for Report Management Sustainability Reports Preview.
 */
@Injectable({
  providedIn: 'root',
})
export class ReportManagementSustainabilityReportsPreviewService {
  constructor(private http: HttpClient) {}

  /**
   * Loads or returns data for the current workflow.
   *
   * @param uuid - Identifier used to target the uuid.
   * @returns The requested API observable or computed data.
   */
  getData(uuid: string): Observable<SustainabilityReportType> {
    // Sustainability preview uses the generic endpoint but has a dedicated summary payload shape.
    // return this.http.get<SustainabilityReportType>((GET_DUMMY_JSON()));
    return this.http.get<SustainabilityReportType>(MANAGE_REPORT_PREVIEW(uuid));
  }
}

/**
 * Describes the Sustainability Report Type data contract used by Unity Reports.
 */
export interface SustainabilityReportType {
  /**
   * Describes the gcp value in the Sustainability Report Type contract.
   */
  gcp: GcpModel;
  /**
   * Describes the aws value in the Sustainability Report Type contract.
   */
  aws: AwsModel;
  /**
   * Describes the private cloud value in the Sustainability Report Type contract.
   */
  private_cloud: PrivateCloudSustainabilityType[];
}

/**
 * Describes the Private Cloud Sustainability Type data contract used by Unity Reports.
 */
export interface PrivateCloudSustainabilityType {
  /**
   * Describes the name value in the Private Cloud Sustainability Type contract.
   */
  name: string;
  /**
   * Describes the region value in the Private Cloud Sustainability Type contract.
   */
  region: string;
  /**
   * Describes the cabinet value in the Private Cloud Sustainability Type contract.
   */
  cabinet: string;
  /**
   * Describes the power consumed value in the Private Cloud Sustainability Type contract.
   */
  power_consumed: number;
  /**
   * Describes the data center value in the Private Cloud Sustainability Type contract.
   */
  data_center: string;
  /**
   * Describes the type value in the Private Cloud Sustainability Type contract.
   */
  type: string;
}

/**
 * Describes the Gcp Model data contract used by Unity Reports.
 */
export interface GcpModel {
  /**
   * Describes the product value in the Gcp Model contract.
   */
  product: ProductModel;
  /**
   * Describes the region value in the Gcp Model contract.
   */
  region: RegionModel;
  /**
   * Describes the summary value in the Gcp Model contract.
   */
  summary: GcpSummaryModel;
  /**
   * Describes the month value in the Gcp Model contract.
   */
  month: MonthModel;
  /**
   * Describes the project value in the Gcp Model contract.
   */
  project: GcpProjectModel;
  /**
   * Describes the year value in the Gcp Model contract.
   */
  year: YearModel;
  /**
   * Describes the quarter value in the Gcp Model contract.
   */
  quarter: QuarterModel;
}

/**
 * Describes the Aws Model data contract used by Unity Reports.
 */
export interface AwsModel {
  /**
   * Describes the month value in the Aws Model contract.
   */
  month: MonthModel;
  /**
   * Describes the summary value in the Aws Model contract.
   */
  summary: AwsSummaryModel;
  /**
   * Describes the accounts value in the Aws Model contract.
   */
  accounts: any;
  /**
   * Describes the account ids value in the Aws Model contract.
   */
  accountIds: any | {};
  /**
   * Describes the year value in the Aws Model contract.
   */
  year: YearModel;
  /**
   * Describes the services value in the Aws Model contract.
   */
  services: any | {};
  /**
   * Describes the quarter value in the Aws Model contract.
   */
  quarter: QuarterModel;
  /**
   * Describes the geography value in the Aws Model contract.
   */
  geography: any | {};
}

/**
 * Describes the Product Model data contract used by Unity Reports.
 */
export interface ProductModel {
  /**
   * Describes the compute engine value in the Product Model contract.
   */
  'Compute Engine': number;
  /**
   * Describes the kubernetes engine value in the Product Model contract.
   */
  'Kubernetes Engine': number;
  /**
   * Describes the networking value in the Product Model contract.
   */
  Networking: number;
  /**
   * Describes the cloud logging value in the Product Model contract.
   */
  'Cloud Logging': number;
  /**
   * Describes the cloud monitoring value in the Product Model contract.
   */
  'Cloud Monitoring': number;
  /**
   * Describes the big query value in the Product Model contract.
   */
  BigQuery: number;
}

/**
 * Describes the Region Model data contract used by Unity Reports.
 */
export interface RegionModel {
  /**
   * Describes the us east4 value in the Region Model contract.
   */
  'us-east4': number;
  /**
   * Describes the us east1 value in the Region Model contract.
   */
  'us-east1': number;
  /**
   * Describes the us central1 value in the Region Model contract.
   */
  'us-central1': number;
  /**
   * Describes the global or multi region value in the Region Model contract.
   */
  'global or multi-region': number;
  /**
   * Describes the us west1 value in the Region Model contract.
   */
  'us-west1': number;
  /**
   * Describes the asia southeast1 value in the Region Model contract.
   */
  'asia-southeast1': number;
  /**
   * Describes the southamerica east1 value in the Region Model contract.
   */
  'southamerica-east1': number;
  /**
   * Describes the europe west1 value in the Region Model contract.
   */
  'europe-west1': number;
}

/**
 * Describes the Gcp Summary Model data contract used by Unity Reports.
 */
export interface GcpSummaryModel {
  /**
   * Describes the total projects value in the Gcp Summary Model contract.
   */
  total_projects: number;
  /**
   * Describes the total products value in the Gcp Summary Model contract.
   */
  total_products: number;
  /**
   * Describes the total accounts value in the Gcp Summary Model contract.
   */
  total_accounts: number;
  /**
   * Describes the total emission value in the Gcp Summary Model contract.
   */
  total_emission: number;
  /**
   * Describes the highest carbon emission product value in the Gcp Summary Model contract.
   */
  highest_carbon_emission_product: string;
}

/**
 * Describes the Month Model data contract used by Unity Reports.
 */
export interface MonthModel {
  /**
   * Describes the july 2number23 value in the Month Model contract.
   */
  'July 2number23': number;
  /**
   * Describes the august 2023 value in the Month Model contract.
   */
  'August 2023': number;
  /**
   * Describes the september 2023 value in the Month Model contract.
   */
  'September 2023': number;
  /**
   * Describes the october 2023 value in the Month Model contract.
   */
  'October 2023': number;
  /**
   * Describes the november 2023 value in the Month Model contract.
   */
  'November 2023': number;
  /**
   * Describes the december 2023 value in the Month Model contract.
   */
  'December 2023': number;
  /**
   * Describes the january 2024 value in the Month Model contract.
   */
  'January 2024': number;
  /**
   * Describes the february 2024 value in the Month Model contract.
   */
  'February 2024': number;
  /**
   * Describes the march 2024 value in the Month Model contract.
   */
  'March 2024': number;
  /**
   * Describes the april 2024 value in the Month Model contract.
   */
  'April 2024': number;
  /**
   * Describes the may 2024 value in the Month Model contract.
   */
  'May 2024': number;
  /**
   * Describes the june 2024 value in the Month Model contract.
   */
  'June 2024': 0;
}

/**
 * Describes the Gcp Project Model data contract used by Unity Reports.
 */
export interface GcpProjectModel {
  /**
   * Describes the istio 258306 value in the Gcp Project Model contract.
   */
  'istio-258306': number;
  /**
   * Describes the devops test 424006 value in the Gcp Project Model contract.
   */
  'devops-test-424006': number;
}

/**
 * Describes the Year Model data contract used by Unity Reports.
 */
export interface YearModel {
  /**
   * Describes the 2022(jan dec) value in the Year Model contract.
   */
  '2022(Jan-Dec)': number;
  /**
   * Describes the 2023(jan dec) value in the Year Model contract.
   */
  '2023(Jan-Dec)': number;
  /**
   * Describes the 2024(jan jun) value in the Year Model contract.
   */
  '2024(Jan-Jun)': number;
}

/**
 * Describes the Quarter Model data contract used by Unity Reports.
 */
export interface QuarterModel {
  /**
   * Describes the q4 2023 value in the Quarter Model contract.
   */
  ' Q4-2023': number;
  /**
   * Describes the q3 2023 value in the Quarter Model contract.
   */
  ' Q3-2023': number;
  /**
   * Describes the q2 2024 value in the Quarter Model contract.
   */
  ' Q2-2024': number;
  /**
   * Describes the q1 2024 value in the Quarter Model contract.
   */
  ' Q1-2024': number;
}

/**
 * Describes the Aws Summary Model data contract used by Unity Reports.
 */
export interface AwsSummaryModel {
  /**
   * Describes the highest carbon emission geography value in the Aws Summary Model contract.
   */
  highest_carbon_emission_geography: string;
  /**
   * Describes the highest carbon emission service value in the Aws Summary Model contract.
   */
  highest_carbon_emission_service: string;
  /**
   * Describes the total emission value in the Aws Summary Model contract.
   */
  total_emission: number;
  /**
   * Describes the total accounts value in the Aws Summary Model contract.
   */
  total_accounts: number;
}
