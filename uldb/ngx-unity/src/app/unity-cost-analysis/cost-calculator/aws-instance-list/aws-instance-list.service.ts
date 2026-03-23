import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GET_AWS_REGION_LIST, GET_AWS_NETWORK_BANDWIDTH_VALUES, GET_AWS_STORAGE_TYPES, GET_AWS_STORAGE_RATES, GET_AWS_INSTANCE_PRICES } from 'src/app/shared/api-endpoint.const';
import { forkJoin, Observable } from 'rxjs';
import { CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { CostCalculatorAWSInstanceItem, CostCalculatorAWSStorageRate } from './aws-instance-list.type';
import { CostCalculatorAWSInstanceViewData } from '../cost-calculator.type';

@Injectable()
export class AwsInstanceListService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getAWSFilterDropdowns() {
    let regionList = this.http.get<Array<{ name: string, code: string, iops_rate: number }>>(GET_AWS_REGION_LIST());
    let bandwidthValues = this.http.get<string[]>(GET_AWS_NETWORK_BANDWIDTH_VALUES());
    let storageTypes = this.http.get<Array<{ name: string, code: string }>>(GET_AWS_STORAGE_TYPES());
    return forkJoin([regionList, bandwidthValues, storageTypes]);
  }

  buildAWSInstanceFiltersForm(region: string, bandwidthValue: string, storageType: string): FormGroup {
    return this.builder.group({
      'region': [region, [Validators.required]],
      'nw_performance': [bandwidthValue, [Validators.required]],
      'storage_type': [storageType, [Validators.required]],
    })
  }

  getStorageRates(filters: AWSFilters): Observable<CostCalculatorAWSStorageRate> {
    let params = new HttpParams().set('region', filters.region).set('storage_type', filters.storage_type);
    return this.http.get<CostCalculatorAWSStorageRate>(GET_AWS_STORAGE_RATES(), { params: params });
  }

  getInstancePrices(cloudUnits: CostCalculatorCloudUnitsFormData, filters: AWSFilters): Observable<CostCalculatorAWSInstanceItem[]> {
    let params = new HttpParams().set('cpu_start', cloudUnits.cpuMainSliderControl[0]).set('cpu_end', cloudUnits.cpuMainSliderControl[1])
      .set('ram_start', cloudUnits.ramMainSliderControl[0]).set('ram_end', cloudUnits.ramMainSliderControl[1])
      .set('lease_contract_length', cloudUnits.commitment.code)
      .set('nw_performance', filters.nw_performance).set('region', filters.region).set('page_size', '0');
    return this.http.get<CostCalculatorAWSInstanceItem[]>(GET_AWS_INSTANCE_PRICES(), { params: params });
  }

  convertToViewData(data: CostCalculatorAWSInstanceItem[], cloudUnits: CostCalculatorCloudUnitsFormData, storageRate: string, filters: AWSFilters, regionList: Array<{ name: string, code: string, iops_rate: number }>): CostCalculatorAWSInstanceViewData[] {
    let viewData: CostCalculatorAWSInstanceViewData[] = [];
    data.map(instance => {
      let a: CostCalculatorAWSInstanceViewData = new CostCalculatorAWSInstanceViewData();
      a.uuid = instance.uuid;
      a.instanceType = instance.instance_type;
      a.OS = instance.os;

      a.minCPUSliderRange = cloudUnits.cpuMainSliderControl[0];
      a.maxCPUSliderRange = cloudUnits.cpuMainSliderControl[1];
      a.minRAMSliderRange = cloudUnits.ramMainSliderControl[0];
      a.maxRAMSliderRange = cloudUnits.ramMainSliderControl[1];
      a.storageSearchedFor = cloudUnits.storage;

      a.cpu = instance.cpu;
      a.ram = instance.ram;
      a.description = instance.description;
      a.commitment = cloudUnits.commitment;

      a.instancesNumber = cloudUnits.instances_number;
      a.instanceRate = Number(instance.rate) * 24 * 30;
      a.instanceBill = cloudUnits.instances_number * Number(instance.rate) * 24 * 30;

      a.storageType = filters.storage_type;
      a.storage = cloudUnits.storage;
      a.storageRate = Number(storageRate);
      a.storageBill = cloudUnits.instances_number * cloudUnits.storage * Number(storageRate);
      if (filters.iops) {
        a.storageBill += Number(filters.iops) * regionList.filter(data => data.name == filters.region)[0].iops_rate
      }

      a.totalBill = a.instanceBill + a.storageBill;
      viewData.push(a);
    })
    return viewData;
  }
}

export class AWSFilters {
  region: string;
  nw_performance: string;
  storage_type: string;
  iops?: string;
  constructor() { }
}