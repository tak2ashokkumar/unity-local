// ──────────────────────────────────────────────
// Lifecycle Management — Static Mock Data
// This file will be replaced by server-side APIs in the future.
// ──────────────────────────────────────────────

// ── Summary KPIs ─────────────────────────────
export interface LifecycleSummaryKpi {
    label: string;
    value: string | number;
    valueClass?: string;
}

export const LIFECYCLE_SUMMARY_KPIS: LifecycleSummaryKpi[] = [
    { label: 'Total Active',     value: 142 },
    { label: 'Healthy',          value: '98.2%' },
    { label: 'Pending Patches',  value: 12 },
    { label: 'Critical Alerts',  value: '03', valueClass: 'text-danger' },
    { label: 'Patch Success',    value: '03' },
    { label: 'Vulnerabilities',  value: '07' },
];

// ── Memory Usage — Donut Chart ────────────────
export interface MemoryUsageItem {
    name: string;
    value: number;
    color: string;
}

export const MEMORY_USAGE_DATA: MemoryUsageItem[] = [
    { name: 'Success',  value: 66.12, color: '#28a745' },
    { name: 'Failure',  value: 33.88, color: '#dc3545' },
];

// ── GPU Thermal — Bar Chart ───────────────────
export interface GpuThermalData {
    gpus: string[];
    temps: number[];
}

export const GPU_THERMAL_DATA: GpuThermalData = {
    gpus: ['Azure Min\nNVIDIA A100', 'Dev Alex\nNVIDIA V100', 'Test TW1\nAMD MI250X', 'Test Dilka2\nGoogle TPU v4', 'Alert Ru\nNVIDIA A40', 'Dev Alpha\nTesla T4'],
    temps: [38, 39, 43, 42, 56, 57],
};

// ── CPU Load — Bar Chart ──────────────────────
export interface CpuLoadData {
    instances: string[];
    loads: number[];
}

export const CPU_LOAD_DATA: CpuLoadData = {
    instances: ['Azure MC\nDelta', 'Dev Alex\nAlert', 'Test TW1', 'Test\nDilka2', 'Alert Ru', 'Dev Alpha\nAlert'],
    loads: [38, 80, 10, 14, 66, 15],
};

// ── Instance Table ────────────────────────────
export interface LifecycleInstance {
    id: number;
    name: string;
    status: 'Active' | 'Disabled';
    statusLabel: string;
    capacityGB: number;
    usedGB: number;
    freePercent: number;
    lastPatched: string;
    compliance: 'meeting' | 'not-meeting';
}

export const LIFECYCLE_INSTANCES: LifecycleInstance[] = [
    { id: 1,  name: 'Azure Min Cost Delta...',  status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 128, freePercent: 50, lastPatched: '31 Dec 2025', compliance: 'meeting'     },
    { id: 2,  name: 'Dev Alex Alert 2 17...',   status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 256,  usedGB: 179, freePercent: 30, lastPatched: '03 Jan 2026', compliance: 'not-meeting' },
    { id: 3,  name: 'Test TW1',                 status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 256,  usedGB: 128, freePercent: 50, lastPatched: '05 Jan 2026', compliance: 'not-meeting' },
    { id: 4,  name: 'Test Dilka2',              status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 128, freePercent: 50, lastPatched: '06 Jan 2026', compliance: 'meeting'     },
    { id: 5,  name: 'Test Alert Ru...',         status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 256,  usedGB: 179, freePercent: 30, lastPatched: '06 Jan 2026', compliance: 'meeting'     },
    { id: 6,  name: 'Dev Alpha Alert R...',     status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 179, freePercent: 30, lastPatched: '01 Jan 2026', compliance: 'not-meeting' },
    { id: 7,  name: 'Dev Unity Test R...',      status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 256,  usedGB: 128, freePercent: 50, lastPatched: '02 Jan 2026', compliance: 'not-meeting' },
    { id: 8,  name: 'Azure Demo client...',     status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 179, freePercent: 30, lastPatched: '01 Jan 2026', compliance: 'meeting'     },
    { id: 9,  name: 'Dev Beta Unity...',        status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 256,  usedGB: 128, freePercent: 50, lastPatched: '03 Jan 2026', compliance: 'not-meeting' },
    { id: 10, name: 'Demo Test...',             status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 1024, usedGB: 922, freePercent: 10, lastPatched: '03 Jan 2026', compliance: 'meeting'     },
    { id: 11, name: 'Azure Prod Server...',     status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 512,  usedGB: 256, freePercent: 50, lastPatched: '04 Jan 2026', compliance: 'meeting'     },
    { id: 12, name: 'Dev Test Instance...',     status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 200, freePercent: 22, lastPatched: '02 Jan 2026', compliance: 'not-meeting' },
    { id: 13, name: 'Cloud Node Alpha...',      status: 'Active',   statusLabel: 'Cisco 1',  capacityGB: 512,  usedGB: 300, freePercent: 41, lastPatched: '05 Jan 2026', compliance: 'meeting'     },
    { id: 14, name: 'Prod Server Beta...',      status: 'Disabled', statusLabel: 'Disabled', capacityGB: 256,  usedGB: 210, freePercent: 18, lastPatched: '01 Jan 2026', compliance: 'not-meeting' },
];
