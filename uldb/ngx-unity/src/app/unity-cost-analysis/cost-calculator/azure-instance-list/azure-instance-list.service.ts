import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GET_AZURE_REGION_LIST, GET_AZURE_TIERS, GET_AZURE_STORAGE_TYPES, GET_AZURE_STORAGE_RATES, GET_AZURE_INSTANCE_PRICES } from 'src/app/shared/api-endpoint.const';
import { forkJoin, Observable } from 'rxjs';
import { CostCalculatorAzureInstanceItem, CostCalculatorAzureStorageRate } from './azure-instance-list.type';
import { CostCalculatorCloudUnitsFormData } from '../cost-calculator.service';
import { CostCalculatorAzureInstanceViewData } from '../cost-calculator.type';

@Injectable()
export class AzureInstanceListService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getAzureFilterDropdowns() {
    let regionList = this.http.get<Array<{ name: string, code: string }>>(GET_AZURE_REGION_LIST());
    let tierValues = this.http.get<string[]>(GET_AZURE_TIERS());
    let storageTypes = this.http.get<Array<{ name: string, code: string }>>(GET_AZURE_STORAGE_TYPES());
    return forkJoin([regionList, tierValues, storageTypes]);
  }

  buildAzureInstanceFiltersForm(region: string, tierValue: string, storageType: string): FormGroup {
    return this.builder.group({
      'region': [region, [Validators.required]],
      'tier': [tierValue, [Validators.required]],
      'storage_type': [storageType, [Validators.required]],
    })
  }

  getStorageRates(storageValue: number, filters: AzureFilters): Observable<CostCalculatorAzureStorageRate> {
    let params = new HttpParams().set('region', filters.region).set('storage', storageValue.toString()).set('storage_type', filters.storage_type);
    return this.http.get<CostCalculatorAzureStorageRate>(GET_AZURE_STORAGE_RATES(), { params: params });
  }

  getInstancePrices(cloudUnits: CostCalculatorCloudUnitsFormData, filters: AzureFilters): Observable<CostCalculatorAzureInstanceItem[]> {
    let params = new HttpParams().set('cpu_start', cloudUnits.cpuMainSliderControl[0]).set('cpu_end', cloudUnits.cpuMainSliderControl[1])
      .set('ram_start', (Number(cloudUnits.ramMainSliderControl[0]) * 1024).toString()).set('ram_end', (Number(cloudUnits.ramMainSliderControl[1]) * 1024).toString())
      .set('tier', filters.tier).set('region', filters.region).set('commitment', cloudUnits.commitment.code).set('page_size', '0');
    return this.http.get<CostCalculatorAzureInstanceItem[]>(GET_AZURE_INSTANCE_PRICES(), { params: params });
  }

  convertToViewData(data: CostCalculatorAzureInstanceItem[], cloudUnits: CostCalculatorCloudUnitsFormData, filters: AzureFilters, storage: CostCalculatorAzureStorageRate): CostCalculatorAzureInstanceViewData[] {
    let viewData: CostCalculatorAzureInstanceViewData[] = [];
    data.map(instance => {
      let a: CostCalculatorAzureInstanceViewData = new CostCalculatorAzureInstanceViewData();
      a.uuid = instance.uuid;
      a.name = instance.size.name;

      a.minCPUSliderRange = cloudUnits.cpuMainSliderControl[0];
      a.maxCPUSliderRange = cloudUnits.cpuMainSliderControl[1];
      a.minRAMSliderRange = cloudUnits.ramMainSliderControl[0];
      a.maxRAMSliderRange = cloudUnits.ramMainSliderControl[1];
      a.storageSearchedFor = cloudUnits.storage;

      a.cpu = instance.size.cpu;
      a.ram = (instance.size.ram_in_mb / 1024).toString();
      a.description = `${instance.meter_sub_category} - ${instance.size.data_disk_count} Max Disks - ${instance.size.resource_disk_size_mb / 1024} GB Temporary Storage`;
      a.commitment = cloudUnits.commitment;

      a.instancesNumber = cloudUnits.instances_number;
      a.instanceRate = Number(instance.rate) * 24 * 30;
      a.instanceBill = cloudUnits.instances_number * Number(instance.rate) * 24 * 30;

      a.storageType = filters.storage_type;
      a.storage = storage.disk_size;
      a.storageRate = Number(storage.rate);
      a.storageBill = cloudUnits.instances_number * Number(storage.rate);

      a.totalBill = a.instanceBill + a.storageBill;
      viewData.push(a);
    })
    return viewData;
  }
}

export class AzureFilters {
  region: string;
  tier: string;
  storage_type: string;
  constructor() { }
}
