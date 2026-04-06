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

// ── GPU Utilization by Job Type — Daily Line Chart ───
// Source: Sum of gpus_utilized pivot (Feb–Apr), Idle is always 0
export interface ResourceUtilizationData {
    categories: string[];
    series: { name: string; data: number[]; color: string }[];
}

export const RESOURCE_UTILIZATION_DATA: ResourceUtilizationData = {
    categories: [
        // Feb (27 days: 02–28)
        '02-Feb', '03-Feb', '04-Feb', '05-Feb', '06-Feb', '07-Feb', '08-Feb', '09-Feb', '10-Feb',
        '11-Feb', '12-Feb', '13-Feb', '14-Feb', '15-Feb', '16-Feb', '17-Feb', '18-Feb', '19-Feb',
        '20-Feb', '21-Feb', '22-Feb', '23-Feb', '24-Feb', '25-Feb', '26-Feb', '27-Feb', '28-Feb',
        // Mar (31 days: 01–31)
        '01-Mar', '02-Mar', '03-Mar', '04-Mar', '05-Mar', '06-Mar', '07-Mar', '08-Mar', '09-Mar',
        '10-Mar', '11-Mar', '12-Mar', '13-Mar', '14-Mar', '15-Mar', '16-Mar', '17-Mar', '18-Mar',
        '19-Mar', '20-Mar', '21-Mar', '22-Mar', '23-Mar', '24-Mar', '25-Mar', '26-Mar', '27-Mar',
        '28-Mar', '29-Mar', '30-Mar', '31-Mar',
        // Apr (2 days: 01–02)
        '01-Apr', '02-Apr'
    ],
    series: [
        {
            name: 'Idle',
            color: '#8a93a2',
            // Always 0 across all 60 dates
            data: Array(60).fill(0)
        },
        {
            name: 'Inference',
            color: '#F7A657',
            data: [
                // Feb (27)
                7, 7, 5, 5, 7, 6, 6, 6, 7, 5, 4, 7, 8, 7, 7, 7, 6, 5, 7, 8, 7, 7, 8, 5, 6, 7, 7,
                // Mar (31)
                8, 7, 7, 4, 5, 8, 7, 7, 7, 8, 5, 5, 8, 7, 7, 7, 7, 6, 4, 8, 7, 6, 8, 7, 5, 6, 8, 7, 8, 8, 8,
                // Apr (2)
                6, 7
            ]
        },
        {
            name: 'Streaming',
            color: '#5DB87A',
            data: [
                // Feb (27)
                5, 5, 2, 3, 5, 6, 6, 5, 4, 3, 5, 4, 5, 6, 6, 5, 5, 3, 5, 3, 4, 5, 4, 5, 4, 5, 5,
                // Mar (31)
                5, 5, 6, 6, 4, 4, 5, 5, 6, 6, 5, 4, 3, 3, 4, 5, 5, 4, 5, 4, 6, 6, 4, 4, 3, 4, 5, 5, 4, 6, 6,
                // Apr (2)
                4, 5
            ]
        },
        {
            name: 'Training',
            color: '#6C86E2',
            data: [
                // Feb (27)
                9, 8, 7, 8, 8, 8, 9, 9, 9, 6, 5, 9, 10, 9, 8, 9, 8, 8, 8, 10, 9, 8, 10, 7, 7, 9, 9,
                // Mar (31)
                9, 8, 9, 6, 6, 9, 9, 9, 9, 9, 7, 8, 11, 11, 9, 8, 9, 7, 7, 10, 9, 8, 11, 9, 7, 7, 9, 10, 10, 9, 8,
                // Apr (2)
                8, 8
            ]
        }
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
