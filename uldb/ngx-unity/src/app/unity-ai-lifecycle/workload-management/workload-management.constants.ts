// ──────────────────────────────────────────────
// Workload Management — Static Mock Data
// This file will be replaced by server-side APIs in the future.
// ──────────────────────────────────────────────

// ── Summary KPIs ─────────────────────────────
export interface WorkloadSummaryKpi {
    label: string;
    value: string | number;
}

export const WORKLOAD_SUMMARY_KPIS: WorkloadSummaryKpi[] = [
    { label: 'ACTIVE GPUs', value: 27 },
    { label: 'RUNNING JOBS', value: 17 },
    { label: 'QUEUED', value: 4 },
    { label: 'AVG WAIT TIME', value: 6 },
    { label: 'THROUGHPUT', value: '83.1%' },
    { label: 'SLA ACHIEVED', value: '91.4%' },
];

// ── Resource Utilization — 24hr Line Chart ───
export interface ResourceUtilizationData {
    categories: string[];
    series: { name: string; data: number[]; color: string }[];
}

export const RESOURCE_UTILIZATION_DATA: ResourceUtilizationData = {
    categories: ['04:00', '08:00', '12:00', '16:00', '20:00', '24:00', '26:00', '28:00', '32:00', 'Now'],
    series: [
        { name: '2021', data: [36, 12, 57, 10, 30, 91, 15, 93, 45, 88], color: '#6c86e2' },
        { name: '2022', data: [60, 13, 62, 11, 45, 67, 19, 38, 15, 79], color: '#79c791' },
        { name: '2023', data: [69, 84, 57, 61, 36, 21, 86, 44, 88, 27], color: '#f5a623' },
    ]
};

// ── GPU Allocation — Donut Chart ─────────────
export interface GpuAllocationItem {
    name: string;
    value: number;
    color: string;
}

export const GPU_ALLOCATION_DATA: GpuAllocationItem[] = [
    { name: 'Training', value: 48, color: '#6c86e2' },
    { name: 'Streaming', value: 12, color: '#79c791' },
    { name: 'Inference', value: 24, color: '#f5a623' },
    { name: 'Available', value: 16, color: '#00bcd4' },
];

export const GPU_ALLOCATION_TOTAL = 100;

// ── Scheduling Throughput — Grouped Bar Chart ─
export interface SchedulingThroughputData {
    categories: string[];
    series: { name: string; data: number[]; color: string }[];
}

export const SCHEDULING_THROUGHPUT_DATA: SchedulingThroughputData = {
    categories: ['1hr', '2hr', '3hr', '4hr', '5hr', '6hr'],
    series: [
        { name: 'Training', data: [12, 12, 29, 5, 17, 14], color: '#7A8EF4' },
        { name: 'Streaming', data: [16, 27, 26, 9, 16, 28], color: '#82D1A1' },
        { name: 'Inference', data: [20, 23, 26, 27, 22, 29], color: '#F7B56B' },
    ]
};

// ── Active Job Table ─────────────────────────
export interface ActiveJob {
    id: string;
    name: string;
    category: string;
    org: string;
    gpus: number;
    status: string;
    duration: string;
}

export const ACTIVE_JOBS_DATA: ActiveJob[] = [
    { id: 'WL-4821', name: 'Financial-Synth-V2', category: 'Training', org: 'NovaBank', gpus: 1, status: 'Disabled', duration: '2h 14m' },
    { id: 'WL-4822', name: 'Financial-Synth-V2', category: 'Inference', org: 'RetailHub', gpus: 4, status: 'running', duration: '-' },
    { id: 'WL-4823', name: 'LLM-FineTune-GPT4', category: 'Training', org: 'Aether Telecom', gpus: 19, status: 'running', duration: '6h 30m' },
    { id: 'WL-4824', name: 'Med-Image-Classify', category: 'Inference', org: 'NovaBank', gpus: 6, status: 'Disabled', duration: '45m' },
    { id: 'WL-4825', name: 'NLP-Sentiment-V3', category: 'Training', org: 'Skyline Health', gpus: 21, status: 'running', duration: '-' },
    { id: 'WL-4826', name: 'Video-Analytics-RT', category: 'Inference', org: 'Vertex Mfg', gpus: 15, status: 'Disabled', duration: '-' },
    { id: 'WL-4827', name: 'Doc-Intelligence-V2', category: 'Streaming', org: 'NovaBank', gpus: 19, status: 'running', duration: '19m' },
    { id: 'WL-4828', name: 'Doc-Intelligence-V3', category: 'Training', org: 'Aether Telecom', gpus: 5, status: 'Disabled', duration: '5h 24m' },
    { id: 'WL-4829', name: 'Med-Image-Classify 01', category: 'Streaming', org: 'RetailHub', gpus: 23, status: 'running', duration: '23m' },
    { id: 'WL-4830', name: 'LLM-FineTune-GPT5', category: 'Training', org: 'NovaBank', gpus: 4, status: 'running', duration: '40m' }
];

// ── GPU Cluster Map — Allocation Status ──────
export type GpuClusterStatus = 'training' | 'streaming' | 'inference' | 'available';

export interface GpuClusterCell {
    status: GpuClusterStatus;
}

const buildClusterMap = (): GpuClusterCell[] => {
    const map: GpuClusterCell[] = [];
    // Training: 40 cells (4 rows)
    for (let i = 0; i < 40; i++) map.push({ status: 'training' });
    // Streaming: 30 cells (3 rows)
    for (let i = 0; i < 30; i++) map.push({ status: 'streaming' });
    // Inference: 20 cells (2 rows)
    for (let i = 0; i < 20; i++) map.push({ status: 'inference' });
    // Available: 10 cells (1 row)
    for (let i = 0; i < 10; i++) map.push({ status: 'available' });
    return map;
};

export const GPU_CLUSTER_MAP_DATA: GpuClusterCell[] = buildClusterMap();

export const GPU_CLUSTER_LEGEND: { label: string; count: number; color: string }[] = [
    { label: 'Training', count: 48, color: '#8BB4F6' },
    { label: 'Streaming', count: 12, color: '#87DFA0' },
    { label: 'Inference', count: 24, color: '#FEE0A1' },
    { label: 'Available', count: 16, color: '#DBDBDB' },
];
