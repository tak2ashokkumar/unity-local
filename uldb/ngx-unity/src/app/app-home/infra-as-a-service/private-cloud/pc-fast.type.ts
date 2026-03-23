export class PCFastData {
    id: number;
    name: string;
    uuid: string;
    platfromType: string;
    displayPlatformType: string;
    vms: number;
    datacenter: string;
    failedAlertsCount?: number;
    totalAlertsCount?: number;
    drillDownLink: string;
    vmsDrillDownLink: string;
    status: string;
    constructor() { };
}