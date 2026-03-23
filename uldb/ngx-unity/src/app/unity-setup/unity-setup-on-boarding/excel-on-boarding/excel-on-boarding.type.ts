export interface OnBoardingWizardStepType {
    icon: string;
    stepName: string;
    url: string;
    active: boolean;
}

export interface ExcelOnboardingSummary {
    mac: number;
    switch: number;
    power: number;
    firewall: number;
    hypervisor: number;
    storage: number;
    loadbalancer: number;
    server: number;
}