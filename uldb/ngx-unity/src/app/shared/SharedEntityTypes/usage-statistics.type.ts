export class UsageStatistics {
    availablevCpu: string | number;
    configuredvCpu: string | number;
    allocatedvCpu: string | number;
    vCpuUtilization: number;
    vCpuUtilizationClass: string;

    availableRam: string | number;
    configuredRam: string | number;
    allocatedRam: string | number;
    ramUtilization: number;
    ramUtilizationClass: string;

    availableStorageDisk: string | number;
    configuredStorageDisk: string | number;
    allocatedStorageDisk: string | number;
    diskUtilization: number;
    diskUtilizationClass: string;
    constructor() { }
}