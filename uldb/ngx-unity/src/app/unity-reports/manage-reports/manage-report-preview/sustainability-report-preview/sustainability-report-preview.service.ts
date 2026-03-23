import { formatNumber } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { MANAGE_REPORT_PREVIEW } from 'src/app/shared/api-endpoint.const';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ManageReportDatacenterDeviceDataType, ManageReportDatacenterDeviceType, ManageReportSustainabilityAwsType, ManageReportSustainabilityGcpType } from './sustainability-report-preview.type';

@Injectable()
export class SustainabilityReportPreviewService {

  constructor(private http: HttpClient,
    @Inject(LOCALE_ID) public locale: string) { }

  getReportPreviewById(uuid: string) {
    return this.http.get<ManageReportDatacenterDeviceType | ManageReportSustainabilityAwsType | ManageReportSustainabilityGcpType>(MANAGE_REPORT_PREVIEW(uuid));
  }

  convertDatacenterDeviceDataToViewData(data: ManageReportDatacenterDeviceDataType[]): ManageReportDatacenterDeviceViewData[] {
    let viewData: ManageReportDatacenterDeviceViewData[] = [];
    data.map(d => {
      let a: ManageReportDatacenterDeviceViewData = new ManageReportDatacenterDeviceViewData();
      a.deviceName = d.name;
      a.ipAddress = d.ip_address ? d.ip_address : 'N/A';
      a.region = d.region ? d.region : 'N/A';
      a.datacenter = d.data_center ? d.data_center : 'N/A';
      a.cabinet = d.cabinet ? d.cabinet : 'N/A';
      a.deviceType = d.type;
      a.deviceMapping = this.getMappingForDeviceType(d.type);
      a.model = d.model ? d.model : 'N/A';
      a.powerUsage = this.getFormattedNumber(d.power_consumed);
      a.co2Emission = this.getFormattedNumber(d.co2_emitted);
      a.uptime = d.uptime;
      a.tags = d.tags;
      viewData.push(a);
    })
    return viewData;
  }

  getMappingForDeviceType(deviceTYpe: string): DeviceMapping {
    switch (deviceTYpe) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'Firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'Load Balancer': return DeviceMapping.LOAD_BALANCER;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'Storage': return DeviceMapping.STORAGE_DEVICES;
      case 'server': return DeviceMapping.BARE_METAL_SERVER;
      case 'Hypervisor': return DeviceMapping.HYPERVISOR;
      case 'Bare Metal': return DeviceMapping.BARE_METAL_SERVER;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'Mac Device': return DeviceMapping.MAC_MINI;
      case 'custom': return DeviceMapping.OTHER_DEVICES;
      case 'Custom': return DeviceMapping.OTHER_DEVICES;
      default: return DeviceMapping.SWITCHES;
    }
  }

  getFormattedNumber(input: number) {
    if (Number.isInteger(input)) {
      return input;
    } else {
      return Number(formatNumber(input, this.locale, '1.0-3'));
    }
  }

  convertAwsCo2DataToViewData(report: ManageReportSustainabilityAwsType): ManageReportSustainabilityAwsReportViewData {
    let viewData = new ManageReportSustainabilityAwsReportViewData();
    viewData.reportType = report.type;
    viewData.totalEmission = report.total_emission;
    viewData.totalAccounts = report.total_accounts;
    viewData.highestCarbonEmissionByService = report.highest_carbon_emission_by_service;
    viewData.highestCarbonEmissionByGeography = report.highest_carbon_emission_by_geography;
    let keys = Object.keys(report.data);
    if (keys.length == 0) {
      return viewData;
    }
    Object.keys(report.data).forEach(reportName => {
      let a = new ManageReportSustainabilityAwsReportTableData();
      a.name = reportName;
      if (reportName == 'Account Id') {
        a.headers = [reportName, 'Emission'];
      } else {
        a.headers = [reportName.split(' ').getFirst(), 'Emission'];
      }
      let reportData = report.data[reportName];
      Object.keys(reportData).forEach(entityName => {
        let td = new ManageReportSustainabilityAwsReportTableValues();
        td.name = entityName;
        td.value = reportData[entityName];
        a.data.push(td);
      })
      viewData.tableData.push(a);
    })
    return viewData;
  }

  convertGcpCo2DataToViewData(report: ManageReportSustainabilityGcpType): ManageReportSustainabilityGcpReportViewData {
    let viewData = new ManageReportSustainabilityGcpReportViewData();
    viewData.reportType = report.type;
    viewData.totalEmission = report.total_emission;
    viewData.totalProducts = report.total_products;
    viewData.totalProjects = report.total_projects;
    viewData.highestCarbonEmissionByProducts = report.highest_carbon_emission_by_product;
    let keys = Object.keys(report.data);
    if (keys.length == 0) {
      return viewData;
    }
    Object.keys(report.data).forEach(reportName => {
      let a = new ManageReportSustainabilityGcpReportTableData();
      a.name = reportName;
      a.headers = [reportName.split(' ').getFirst(), 'Emission'];
      let reportData = report.data[reportName];
      Object.keys(reportData).forEach(entityName => {
        let td = new ManageReportSustainabilityGcpReportTableValues();
        td.name = entityName;
        td.value = reportData[entityName];
        a.data.push(td);
      })
      viewData.tableData.push(a);
    })
    return viewData;
  }
}

export class ManageReportDatacenterDeviceViewData {
  constructor() { }
  deviceName: string;
  ipAddress: string;
  region: string;
  datacenter: string;
  cabinet: string;
  deviceType: string;
  deviceMapping: DeviceMapping;
  model: string;
  powerUsage: number;
  co2Emission: number;
  uptime: string;
  tags: string[]
}

export class ManageReportSustainabilityAwsReportViewData {
  constructor() { }
  reportType: string;
  highestCarbonEmissionByService: string;
  totalAccounts: number;
  totalEmission: number;
  highestCarbonEmissionByGeography: string;
  tableData: ManageReportSustainabilityAwsReportTableData[] = [];
}

export class ManageReportSustainabilityAwsReportTableData {
  name: string;
  headers: string[] = [];
  data: ManageReportSustainabilityAwsReportTableValues[] = [];
}

export class ManageReportSustainabilityAwsReportTableValues {
  name: string;
  value: number;
}

export class ManageReportSustainabilityGcpReportViewData {
  constructor() { }
  reportType: string;
  totalEmission: number;
  totalProducts: number;
  totalProjects: number;
  highestCarbonEmissionByProducts: string;
  tableData: ManageReportSustainabilityGcpReportTableData[] = [];
}

export class ManageReportSustainabilityGcpReportTableData {
  name: string;
  headers: string[] = [];
  data: ManageReportSustainabilityGcpReportTableValues[] = [];
}

export class ManageReportSustainabilityGcpReportTableValues {
  name: string;
  value: number;
}