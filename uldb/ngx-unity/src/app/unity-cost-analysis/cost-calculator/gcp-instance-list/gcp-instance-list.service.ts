import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { GCPInstanceType, GCPSeries, GCPCostCalculatorResponseItem, GCPCostCalculatorStorageRate } from './gcp-instance-list.type';
import { CostCalculatorGcpInstanceViewData } from '../cost-calculator.type';
import { CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { GET_GCP_MACHINE_TYPE_PRICING, GET_GCP_STORAGE_PRICING, GET_GCP_REGION_LIST, GET_GCP_STORAGE_TYPE_LIST, GET_GCP_INSTANCES_DATA } from 'src/app/shared/api-endpoint.const';
import { Observable, forkJoin } from 'rxjs';

@Injectable()
export class GcpInstanceListService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getGCPFilterDropdowns() {
    let regionList = this.http.get<Array<{ name: string, code: string }>>(GET_GCP_REGION_LIST());
    let storageTypes = this.http.get<Array<{ name: string, code: string }>>(GET_GCP_STORAGE_TYPE_LIST());
    let instancesData = this.http.get<Array<GCPInstanceType>>(GET_GCP_INSTANCES_DATA());
    return forkJoin([regionList, storageTypes, instancesData]);
  }

  buildGCPInstanceFiltersForm(region: string, storageType: string, machineClass: string, machineFamily: GCPInstanceType, machineSeries: GCPSeries): FormGroup {
    return this.builder.group({
      'region': [region, [Validators.required]],
      'storage_type': [storageType, [Validators.required]],
      'machine_class': [machineClass, [Validators.required]],
      'machine_family': [machineFamily, [Validators.required]],
      'series': [machineSeries, [Validators.required]],
    })
  }

  getStorageRates(filters: any): Observable<GCPCostCalculatorStorageRate> {
    let params = new HttpParams().set('region', filters.region).set('storage_type', filters.storage_type);
    return this.http.get<GCPCostCalculatorStorageRate>(GET_GCP_STORAGE_PRICING(), { params: params });
  }

  getMachineTypePrice(cloudUnits: CostCalculatorCloudUnitsFormData, filters: GCPFilters): Observable<GCPCostCalculatorResponseItem> {
    let params = new HttpParams().set('region', filters.region).set('machine_type', filters.series.code)
      .set('machine_class', filters.machine_class).set('commitment', cloudUnits.commitment.code);
    return this.http.get<GCPCostCalculatorResponseItem>(GET_GCP_MACHINE_TYPE_PRICING(), { params: params });
  }

  convertToViewData(cloudUnits: CostCalculatorCloudUnitsFormData, filters: GCPFilters, machineTypePrice: GCPCostCalculatorResponseItem, storageRate: number): CostCalculatorGcpInstanceViewData[] {
    let viewData: CostCalculatorGcpInstanceViewData[] = [];
    filters.series.machine_types.map(instance => {
      let isInRange = instance.cpu >= cloudUnits.cpuMainSliderControl[0] && instance.cpu <= cloudUnits.cpuMainSliderControl[1] &&
        Number(instance.ram) >= (Number(cloudUnits.ramMainSliderControl[0]) * 1024) && Number(instance.ram) <= (Number(cloudUnits.ramMainSliderControl[1]) * 1024)
      if (isInRange) {
        let a: CostCalculatorGcpInstanceViewData = new CostCalculatorGcpInstanceViewData();
        a.instanceType = instance.name;

        a.minCPUSliderRange = cloudUnits.cpuMainSliderControl[0];
        a.maxCPUSliderRange = cloudUnits.cpuMainSliderControl[1];
        a.minRAMSliderRange = cloudUnits.ramMainSliderControl[0];
        a.maxRAMSliderRange = cloudUnits.ramMainSliderControl[1];
        a.storageSearchedFor = cloudUnits.storage;

        a.cpu = Number(instance.cpu);
        a.ram = (Number(instance.ram) / 1024).toString();
        a.description = null;
        a.commitment = cloudUnits.commitment;

        a.instancesNumber = cloudUnits.instances_number;
        a.instanceRate = ((Number(instance.cpu) * machineTypePrice.cpu) + (Number(instance.ram) / 1024) * machineTypePrice.ram) * 24 * 30;
        a.instanceBill = cloudUnits.instances_number * a.instanceRate;

        a.storageType = filters.storage_type;
        a.storage = cloudUnits.storage;
        a.storageRate = Number(storageRate);
        a.storageBill = cloudUnits.instances_number * cloudUnits.storage * Number(storageRate);

        a.totalBill = a.instanceBill + a.storageBill;
        viewData.push(a);
      }
    })
    return viewData;
  }
}

export const gcpMachineClasses: string[] = [
  "Regular",
  "Preemptible"
];

export class GCPFilters {
  region: string;
  storage_type: string;
  machine_class: string;
  machine_family: GCPInstanceType;
  series: GCPSeries;
  constructor() { }
}
