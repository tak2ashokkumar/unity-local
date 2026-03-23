export interface FinOpsInfrastructureElement {
    'Device Name': string;
    'Management IP': string;
    Device_Type: string;
    'CPU Usage (%)': number;
    'vCPU Allocation': string;
    'vCPU Used': string;
    'vCPU Free': string;
    'Memory Usage (%)': number;
    'Memory Capacity': string;
    'Memory Used': string;
    'Memory Free': string;
}

export interface FinOpsAlerts {
    'Alert ID': number;
    'Device Name': string;
    'Management IP': string;
    'Device Type': string;
    Count: number;
    'Event Metric': string;
    'Event Time': string;
    Severity: string;
    Description: string;
}

export interface FinOpsCostElements {
    'Device Name': string;
    'IP Address': string;
    'Device Type': string;
    'CPU Usage (%)'?: number;
    'Memory Usage (%)'?: number;
    'Disk Usage': string;
    'Compute Cost ($)': number;
    OS: string;
}