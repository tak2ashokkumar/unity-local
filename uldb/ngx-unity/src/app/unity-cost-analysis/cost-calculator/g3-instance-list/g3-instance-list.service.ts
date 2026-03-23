import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GET_G3_REGION_LIST, GET_G3_STORAGE_TYPES } from 'src/app/shared/api-endpoint.const';
import { forkJoin } from 'rxjs';
import { CostCalculatorG3InstanceViewData } from '../cost-calculator.type';
import { CostCalculatorCloudUnitsFormData, CostcalculatorCommitmentYearsCodes } from '../cost-calculator.service';

@Injectable()
export class G3InstanceListService {

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  getG3FilterDropdowns() {
    let regionList = this.http.get<Array<{ name: string, code: string, iops_rate: number }>>(GET_G3_REGION_LIST());
    let storageTypes = this.http.get<Array<{ name: string, code: string, price_per_GB: string }>>(GET_G3_STORAGE_TYPES());
    return forkJoin([regionList, storageTypes]);
  }

  buildG3InstanceFiltersForm(filters: G3Filters): FormGroup {
    return this.builder.group({
      'region': [filters.region, [Validators.required]],
      'storage_type': [filters.storage_type, [Validators.required]],
    })
  }

  convertToViewData(cloudUnits: CostCalculatorCloudUnitsFormData, filters: G3Filters): CostCalculatorG3InstanceViewData[] {
    let viewData: CostCalculatorG3InstanceViewData[] = [];
    let a = new CostCalculatorG3InstanceViewData();
    a.instanceType = 'G3 Standard';
    a.minCPUSliderRange = cloudUnits.cpuMainSliderControl[0];
    a.maxCPUSliderRange = cloudUnits.cpuMainSliderControl[1];
    a.minRAMSliderRange = cloudUnits.ramMainSliderControl[0];
    a.maxRAMSliderRange = cloudUnits.ramMainSliderControl[1];
    a.storageSearchedFor = cloudUnits.storage;

    a.cpu = Number(cloudUnits.cpuMainSliderControl[0]);
    a.ram = cloudUnits.ramMainSliderControl[0];
    a.description = null;
    a.commitment = cloudUnits.commitment;

    a.instancesNumber = cloudUnits.instances_number;
    a.storageType = filters.storage_type.name;
    a.storage = cloudUnits.storage;

    a.instanceRate = Number(cloudUnits.cpuMainSliderControl[0]) * G3_PRICES.vCPU + Number(cloudUnits.ramMainSliderControl[0]) * G3_PRICES.RAM;
    a.storageRate = Number(filters.storage_type.price_per_GB);
    switch (cloudUnits.commitment.code) {
      case CostcalculatorCommitmentYearsCodes.ONE:
        a.instanceRate = a.instanceRate - G3DiscountInPercentage.INSTANCE_1YR / 100 * a.instanceRate;
        a.storageRate = a.storageRate - G3DiscountInPercentage.STORAGE_1YR / 100 * a.storageRate;
        break;
      case CostcalculatorCommitmentYearsCodes.THREE:
        a.instanceRate = a.instanceRate - G3DiscountInPercentage.INSTANCE_3YR / 100 * a.instanceRate;
        a.storageRate = a.storageRate - G3DiscountInPercentage.STORAGE_3YR / 100 * a.storageRate;
        break;
    }

    a.instanceBill = cloudUnits.instances_number * a.instanceRate;
    a.storageBill = cloudUnits.instances_number * cloudUnits.storage * a.storageRate;

    a.totalBill = a.instanceBill + a.storageBill;

    viewData.push(a);
    return viewData;
  }
}

export class G3Filters {
  constructor() { }
  region: string;
  storage_type: { name: string, code: string, price_per_GB: string };
}

export enum G3_PRICES {
  vCPU = 10.000,
  RAM = 10.000
}

export enum G3DiscountInPercentage {
  STORAGE_1YR = 10,
  STORAGE_3YR = 20,
  INSTANCE_1YR = 25,
  INSTANCE_3YR = 35
}
