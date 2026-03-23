import { CostCalculatorCommitmentYear } from './cost-calculator.service';

export abstract class AbstractCostComparatorViewData {
    uuid: string;
    cpu: number;
    ram: string;
    minCPUSliderRange: string;
    maxCPUSliderRange: string;
    maxRAMSliderRange: string;
    minRAMSliderRange: string;
    storageSearchedFor: number;
    description: string;
    commitment: CostCalculatorCommitmentYear;
    instancesNumber: number;
    instanceRate: number;
    instanceBill: number;
    storageType: string;
    storage: number;
    storageRate: number;
    storageBill: number;
    totalBill: number;
    isSelected: boolean;
    badgeClass: string = 'bg-gray-700 text-white';
    bgClass: string = "text-dark";
}

export class CostCalculatorAWSInstanceViewData extends AbstractCostComparatorViewData {
    instanceType: string;
    OS: string;
    constructor() {
        super();
    }
}

export class CostCalculatorAzureInstanceViewData extends AbstractCostComparatorViewData {
    name: string;
    constructor() {
        super();
    }
}

export class CostCalculatorGcpInstanceViewData extends AbstractCostComparatorViewData {
    instanceType: string;
    constructor() {
        super();
    }
}

export class CostCalculatorG3InstanceViewData extends AbstractCostComparatorViewData {
    instanceType: string;
    constructor() {
        super();
    }
}