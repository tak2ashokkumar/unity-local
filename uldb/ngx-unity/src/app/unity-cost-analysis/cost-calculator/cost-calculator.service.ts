import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Options } from '@angular-slider/ngx-slider';
import { DecimalPipe } from '@angular/common';
import { CostCalculatorAWSInstanceViewData, CostCalculatorAzureInstanceViewData, CostCalculatorGcpInstanceViewData, CostCalculatorG3InstanceViewData } from './cost-calculator.type';

@Injectable()
export class CostCalculatorService {

  constructor(private builder: FormBuilder,
    private decimalPipe: DecimalPipe) { }

  resetcloudUnitsFormErrors() {
    return {
      'storage': '',
      'instances_number': '',
      'commitment': ''
    };
  }

  cloudUnitsValidationMessages = {
    'storage': {
      'required': 'This Field is Required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'instances_number': {
      'required': 'This Field is Required',
      'min': 'Minimum value should be greater than or equal to 1'
    },
    'commitment': {
      'required': 'This Field is Required'
    }
  };

  cloudUnitsFormOptions(): CostCalculatorSliderOptions {
    let options: CostCalculatorSliderOptions = new CostCalculatorSliderOptions();
    options.cpuFullOptions = new CostCalculatorSliderOptionUnits();
    options.cpuFullOptions.draggableRangeOnly = true;
    options.cpuMainOptions = new CostCalculatorSliderOptionUnits();
    options.cpuMainOptions.ceil = 50;

    options.ramFullOptions = new CostCalculatorSliderOptionUnits();
    options.ramFullOptions.ceil = 1000;
    options.ramFullOptions.draggableRangeOnly = true;
    options.ramMainOptions = new CostCalculatorSliderOptionUnits();
    options.ramMainOptions.ceil = 100;
    return options;
  }

  buildCloudUnitsForm(termPlan: CostCalculatorCommitmentYear): FormGroup {
    this.resetcloudUnitsFormErrors();
    return this.builder.group({
      'cpuMainSliderControl': new FormControl([1, 10]),
      'cpuFullSliderControl': new FormControl([1, 50]),
      'ramMainSliderControl': new FormControl([1, 32]),
      'ramFullSliderControl': new FormControl([1, 100]),
      'storage': ['', [Validators.required, Validators.min(1)]],
      'instances_number': ['', [Validators.required, Validators.min(1)]],
      'commitment': [termPlan, Validators.required]
    });
  }

  getInstanceComparisonData(selectedInstance: CostCalculatorSelectedInstanceData): InstanceComparator {
    let viewdata: InstanceComparator = new InstanceComparator();
    if (selectedInstance.aws) {
      viewdata.instanceCount = selectedInstance.aws.instancesNumber;
      viewdata.storageCount = selectedInstance.aws.storageSearchedFor;
      viewdata.commitment = selectedInstance.aws.commitment;
      viewdata.cloudsToCompare++;
      viewdata.cpuMinRange = selectedInstance.aws.minCPUSliderRange;
      viewdata.cpuMaxRange = selectedInstance.aws.maxCPUSliderRange;
      viewdata.ramMinRange = selectedInstance.aws.minRAMSliderRange;
      viewdata.ramMaxRange = selectedInstance.aws.maxRAMSliderRange;

      viewdata.aws = new instanceDetails();
      viewdata.aws.storage = `${selectedInstance.aws.storageType} - ${selectedInstance.aws.storage}GB`;
      const ram = this.decimalPipe.transform(selectedInstance.aws.ram, '1.0-2');
      viewdata.aws.instanceName = `${selectedInstance.aws.instanceType} - ${selectedInstance.aws.OS} - (${selectedInstance.aws.cpu} X ${ram})`;
      viewdata.aws.totalBill = selectedInstance.aws.totalBill;
    }

    if (selectedInstance.azure) {
      viewdata.instanceCount = selectedInstance.azure.instancesNumber;
      viewdata.storageCount = selectedInstance.azure.storageSearchedFor;
      viewdata.commitment = selectedInstance.azure.commitment;
      viewdata.cloudsToCompare++;
      viewdata.cpuMinRange = selectedInstance.azure.minCPUSliderRange;
      viewdata.cpuMaxRange = selectedInstance.azure.maxCPUSliderRange;
      viewdata.ramMinRange = selectedInstance.azure.minRAMSliderRange;
      viewdata.ramMaxRange = selectedInstance.azure.maxRAMSliderRange;

      viewdata.azure = new instanceDetails();
      viewdata.azure.storage = `${selectedInstance.azure.storageType} - ${selectedInstance.azure.storage}GB`;
      viewdata.azure.instanceName = `${selectedInstance.azure.name} - (${selectedInstance.azure.cpu} X ${selectedInstance.azure.ram})`;
      viewdata.azure.totalBill = selectedInstance.azure.totalBill;
    }

    if (selectedInstance.gcp) {
      viewdata.instanceCount = selectedInstance.gcp.instancesNumber;
      viewdata.storageCount = selectedInstance.gcp.storageSearchedFor;
      viewdata.commitment = selectedInstance.gcp.commitment;
      viewdata.cloudsToCompare++;
      viewdata.cpuMinRange = selectedInstance.gcp.minCPUSliderRange;
      viewdata.cpuMaxRange = selectedInstance.gcp.maxCPUSliderRange;
      viewdata.ramMinRange = selectedInstance.gcp.minRAMSliderRange;
      viewdata.ramMaxRange = selectedInstance.gcp.maxRAMSliderRange;

      viewdata.gcp = new instanceDetails();
      viewdata.gcp.storage = `${selectedInstance.gcp.storageType} - ${selectedInstance.gcp.storage}GB`;
      viewdata.gcp.instanceName = `${selectedInstance.gcp.instanceType} - (${selectedInstance.gcp.cpu} X ${selectedInstance.gcp.ram})`;
      viewdata.gcp.totalBill = selectedInstance.gcp.totalBill;
    }

    if (selectedInstance.g3_cloud) {
      viewdata.instanceCount = selectedInstance.g3_cloud.instancesNumber;
      viewdata.storageCount = selectedInstance.g3_cloud.storageSearchedFor;
      viewdata.commitment = selectedInstance.g3_cloud.commitment;
      viewdata.cloudsToCompare++;
      viewdata.cpuMinRange = selectedInstance.g3_cloud.minCPUSliderRange;
      viewdata.cpuMaxRange = selectedInstance.g3_cloud.maxCPUSliderRange;
      viewdata.ramMinRange = selectedInstance.g3_cloud.minRAMSliderRange;
      viewdata.ramMaxRange = selectedInstance.g3_cloud.maxRAMSliderRange;

      viewdata.g3_cloud = new instanceDetails();
      viewdata.g3_cloud.storage = `${selectedInstance.g3_cloud.storageType} - ${selectedInstance.g3_cloud.storage}GB`;
      viewdata.g3_cloud.instanceName = `${selectedInstance.g3_cloud.instanceType} - (${selectedInstance.g3_cloud.cpu} X ${selectedInstance.g3_cloud.ram})`;
      viewdata.g3_cloud.totalBill = selectedInstance.g3_cloud.totalBill;
    }
    return viewdata;
  }


}

export class CostCalculatorSliderOptions {
  cpuFullOptions: Options;
  cpuMainOptions: Options;
  ramFullOptions: Options;
  ramMainOptions: Options;
  constructor() { }
}

export class CostCalculatorSliderOptionUnits extends Options {
  floor?: number = 1;
  ceil?: number = 500;
  step?: number = 1;
  draggableRangeOnly?: boolean = false;
  constructor() {
    super();
  }
}

export class CostCalculatorCloudDetails {
  name: string;
  displayName: string;
  isSelected: boolean = false;
  isDisabled: boolean = false;
  totalPrice: number;
  instancesSelected: number;
  icon: string;

  get bgClass() {
    if (this.isSelected) {
      return 'bg-teal text-white';
    }
    if (this.isDisabled) {
      return 'bg-light';
    }
    return 'bg-blue text-white';
  }

  get textClass() {
    if (this.isDisabled) {
      return 'text-secondary';
    }
    return 'text-muted';
  }

  constructor(name: string,
    displayName: string,
    isSelected: boolean,
    isDisabled: boolean,
    totalPrice: number,
    instancesSelected: number,
    icon: string) {
    this.name = name;
    this.displayName = displayName;
    this.isSelected = isSelected;
    this.isDisabled = isDisabled;
    this.totalPrice = totalPrice;
    this.instancesSelected = instancesSelected;
    this.icon = icon;
  }
}

export enum CLOUD_TYPES {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  G3_CLOUD = 'g3_cloud',
  VMWARE = 'vmware'
}

export const cloudList: CostCalculatorCloudDetails[] = [
  new CostCalculatorCloudDetails(CLOUD_TYPES.AWS, 'AWS', false, false, 0, 0, 'fab fa-aws'),
  new CostCalculatorCloudDetails(CLOUD_TYPES.AZURE, 'Azure', false, false, 0, 0, 'cfa-azure'),
  new CostCalculatorCloudDetails(CLOUD_TYPES.GCP, 'GCP', false, false, 0, 0, 'cfa-gcp'),
  new CostCalculatorCloudDetails(CLOUD_TYPES.G3_CLOUD, 'G3 Cloud', false, false, 0, 0, 'cfa-vmware'),
];

export class CostCalculatorCloudUnitsFormData {
  cpuMainSliderControl: string[];
  cpuFullSliderControl: string[];
  ramMainSliderControl: string[];
  ramFullSliderControl: string[];
  storage: number;
  instances_number: number;
  commitment: CostCalculatorCommitmentYear;
  constructor() { }
}

export class CostCalculatorSelectedInstanceData {
  aws: CostCalculatorAWSInstanceViewData;
  azure: CostCalculatorAzureInstanceViewData;
  gcp: CostCalculatorGcpInstanceViewData;
  g3_cloud: CostCalculatorG3InstanceViewData;
}

class instanceDetails {
  instanceName: string;
  totalBill: number;
  storage: string;
}

export class InstanceComparator {
  instanceCount: number;
  storageCount: number;
  commitment: CostCalculatorCommitmentYear;
  cloudsToCompare: number = 0;

  cpuMinRange: string;
  cpuMaxRange: string;
  ramMinRange: string;
  ramMaxRange: string;

  aws?: instanceDetails;
  azure?: instanceDetails
  gcp?: instanceDetails;
  g3_cloud?: instanceDetails;
}

export class CostCalculatorCommitmentYear {
  displayText: string;
  code: string;
}

export enum CostcalculatorCommitmentYearsCodes {
  ZERO = '0yr',
  ONE = '1yr',
  THREE = '3yr'
}


export const costcalculatorCommitmentYears: CostCalculatorCommitmentYear[] = [
  {
    displayText: 'On demand',
    code: CostcalculatorCommitmentYearsCodes.ZERO
  },
  {
    displayText: '1 Year',
    code: CostcalculatorCommitmentYearsCodes.ONE
  },
  {
    displayText: '3 Years',
    code: CostcalculatorCommitmentYearsCodes.THREE
  }
];
