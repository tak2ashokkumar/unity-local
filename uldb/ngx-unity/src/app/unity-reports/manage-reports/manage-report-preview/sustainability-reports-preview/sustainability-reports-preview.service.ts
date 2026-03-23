import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_DUMMY_JSON, MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class SustainabilityReportsPreviewService {

  constructor(private http: HttpClient) { }

  getData(uuid: string): Observable<SustainabilityReportType> {
    // return this.http.get<SustainabilityReportType>((GET_DUMMY_JSON()));
    return this.http.get<SustainabilityReportType>((MANAGE_REPORT_PREVIEW(uuid)));
  }
}

export interface SustainabilityReportType {
  gcp: GcpModel;
  aws: AwsModel;
  private_cloud: PrivateCloudSustainabilityType[];
}

export interface PrivateCloudSustainabilityType {
  name: string;
  region: string;
  cabinet: string;
  power_consumed: number;
  data_center: string;
  type: string;
}

export interface ViewDataModel {
  gcp: GcpModel;
  aws: AwsModel;
  privateCloud: PrivateCloudModel;
}

export interface GcpModel {
  product: ProductModel;
  region: RegionModel;
  summary: GcpSummaryModel;
  month: MonthModel;
  project: GcpProjectModel;
  year: YearModel;
  quarter: QuarterModel;
}

export interface AwsModel {
  month: MonthModel;
  summary: AwsSummaryModel;
  accounts: any;
  accountIds: any | {};
  year: YearModel;
  services: any | {};
  quarter: QuarterModel;
  geography: any | {};
}

export interface PrivateCloudModel {
  name: string;
  region: string;
  cabinet: string;
  power_consumed: number;
  data_center: string;
  type: string;
}

export interface ProductModel {
  "Compute Engine": number;
  "Kubernetes Engine": number;
  "Networking": number;
  "Cloud Logging": number;
  "Cloud Monitoring": number;
  "BigQuery": number;
}

export interface RegionModel {
  "us-east4": number;
  "us-east1": number;
  "us-central1": number;
  "global or multi-region": number;
  "us-west1": number;
  "asia-southeast1": number;
  "southamerica-east1": number;
  "europe-west1": number;
}

export interface GcpSummaryModel {
  "total_projects": number;
  "total_products": number;
  "total_accounts": number;
  "total_emission": number;
  "highest_carbon_emission_product": string;
}

export interface MonthModel {
  "July 2number23": number;
  "August 2023": number;
  "September 2023": number;
  "October 2023": number;
  "November 2023": number;
  "December 2023": number;
  "January 2024": number;
  "February 2024": number;
  "March 2024": number;
  "April 2024": number
  "May 2024": number;
  "June 2024": 0;
}

export interface GcpProjectModel {
  "istio-258306": number;
  "devops-test-424006": number;
}

export interface YearModel {
  "2022(Jan-Dec)": number;
  "2023(Jan-Dec)": number;
  "2024(Jan-Jun)": number;
}

export interface QuarterModel {
  " Q4-2023": number;
  " Q3-2023": number;
  " Q2-2024": number;
  " Q1-2024": number;
}

export interface AwsSummaryModel {
  "highest_carbon_emission_geography": string;
  "highest_carbon_emission_service": string;
  "total_emission": number;
  "total_accounts": number;
}
