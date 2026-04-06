// ──────────────────────────────────────────────
// Unity AI Infra Mgmt Storage — Static Mock Data
// This file will be replaced by server-side APIs in the future.
// ──────────────────────────────────────────────

// ── Summary KPIs ─────────────────────────────
export interface StorageSummaryKpi {
    label: string;
    value: string;
    unit?: string;
}

export const STORAGE_SUMMARY_KPIS: StorageSummaryKpi[] = [
    { label: 'TOTAL CAPACITY', value: '13.6', unit: 'PB' },
    { label: 'USED', value: '8.8', unit: 'PB' },
    { label: 'UTILIZATION', value: '65', unit: '%' },
    { label: 'PEAK IOPS', value: '8.3', unit: 'M' },
    { label: 'THROUGHPUT', value: '195', unit: 'GB/s' },
    { label: 'SLA', value: '99.6', unit: '%' },
];

// ── Storage Pool Cards ───────────────────────
export interface StoragePoolCard {
    poolId: string;
    name: string;
    description: string;
    utilizationPercent: number;
    usedTB: string;
    totalTB: string;
    iops: string;
    throughput: string;
    barColor: string;
}

export const STORAGE_POOL_CARDS: StoragePoolCard[] = [
    {
        poolId: 'POOL-001',
        name: 'Hot Storage (NVMe)',
        description: 'Improve conversion without increasing traffic spend.',
        utilizationPercent: 70,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '2.4M IOPS',
        throughput: '48 GB/s',
        barColor: '#3b82f6',
    },
    {
        poolId: 'POOL-002',
        name: 'Warm Storage (SSD)',
        description: 'Improve conversion without increasing traffic spend.',
        utilizationPercent: 60,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '480K IOPS',
        throughput: '12 GB/s',
        barColor: '#10b981',
    },
    {
        poolId: 'POOL-003',
        name: 'Cold Archive (HDD)',
        description: 'Improve conversion without increasing traffic spend.',
        utilizationPercent: 67,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '15K IOPS',
        throughput: '2 GB/s',
        barColor: '#3b82f6',
    },
    {
        poolId: 'POOL-004',
        name: 'Object Store (S3)',
        description: 'CPU, memory, and system load rise sharply during surges.',
        utilizationPercent: 79,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '2.1M IOPS',
        throughput: '44 GB/s',
        barColor: '#3b82f6',
    },
    {
        poolId: 'POOL-005',
        name: 'Hot Storage (NVMe)',
        description: 'LTV-driven revenue growth; retention beats acquisition.',
        utilizationPercent: 63,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '100K IOPS',
        throughput: '25 GB/s',
        barColor: '#10b981',
    },
    {
        poolId: 'POOL-006',
        name: 'GPU Direct Storage',
        description: 'A small subset concentrates risk and critical alerts.',
        utilizationPercent: 77,
        usedTB: '178 TB',
        totalTB: '256 TB',
        iops: '3.2M IOPS',
        throughput: '64 GB/s',
        barColor: '#3b82f6',
    },
];

// ── I/O Operation — Line Chart ───────────────
export interface IoOperationData {
    categories: string[];
    series: { name: string; data: number[]; color: string }[];
}

export const IO_OPERATION_DATA: IoOperationData = {
    categories: ['5min', '10min', '15min', '20min', '25min', '30min', '35min', '40min', '45min', '50min'],
    series: [
        { name: 'Read', data: [900, 250, 1450, 250, 750, 2250, 400, 2300, 1150, 2000], color: '#8eaafb' },
        { name: 'Write', data: [1500, 350, 1550, 300, 1100, 1650, 500, 950, 400, 2200], color: '#aeebb8' },
    ]
};

// ── Storage by Tenant — Horizontal Bar Chart ─
export interface StorageByTenantItem {
    name: string;
    value: number;
}

export const STORAGE_BY_TENANT_DATA: StorageByTenantItem[] = [
    { name: 'Polar Insu...', value: 420 },
    { name: 'Retail Hub', value: 380 },
    { name: 'Nova Bank', value: 280 },
    { name: 'Horizon Me...', value: 210 },
];

// ── Data Growth Trend — Line Chart ───────────
export interface DataGrowthTrendData {
    categories: string[];
    data: number[];
}

export const DATA_GROWTH_TREND: DataGrowthTrendData = {
    categories: ["Jun'25", "Jul'25", "Aug'25", "Sept'25", "Oct'25", "Nov'25", "Dec'25", "Jan'26", "Feb'26", "Mar'26"],
    data: [3.0, 1.2, 5.8, 1.0, 3.0, 9.2, 1.5, 9.5, 4.5, 8.0],
};

// ── Storage Pool Inventory — Table ───────────
export interface StoragePoolInventoryItem {
    pool: string;
    name: string;
    type: string;
    tier: string;
    capacity: string;
    used: string;
    utilPercent: string;
    iops: string;
    throughput: string;
    region: string;
    status: string;
}

export const STORAGE_POOL_INVENTORY: StoragePoolInventoryItem[] = [
    { pool: 'Pool-01', name: 'Hot Storage (NVMe)', type: 'NVMe SSD', tier: 'Hot', capacity: '256 TB', used: '178 TB', utilPercent: '70%', iops: '2.4M', throughput: '48 GB/s', region: 'us-east-1', status: 'Live' },
    { pool: 'Pool-02', name: 'Warm Storage (SSD)', type: 'SAS SSD', tier: 'Warm', capacity: '1024 TB', used: '612 TB', utilPercent: '60%', iops: '480K', throughput: '12 GB/s', region: 'us-east-1', status: 'Live' },
    { pool: 'Pool-03', name: 'Cold Archive (HDD)', type: 'HDD Archive', tier: 'Hot', capacity: '4096 TB', used: '2841 TB', utilPercent: '19%', iops: '15K', throughput: '2 GB/s', region: 'us-east-1', status: 'Live' },
    { pool: 'Pool-04', name: 'Object Store (S3)', type: 'NVMe SSD', tier: 'Warm', capacity: '256 TB', used: '201 TB', utilPercent: '56%', iops: '2.1M', throughput: '44 GB/s', region: 'eu-central-1', status: 'Live' },
    { pool: 'Pool-05', name: 'Hot Storage (NVMe)', type: 'Object', tier: 'GPU-Direct', capacity: '8192 TB', used: '5120 TB', utilPercent: '21%', iops: '100K', throughput: '25 GB/s', region: 'Global', status: 'Live' },
    { pool: 'Pool-06', name: 'GPU Direct Storage', type: 'NVMe SSD', tier: 'Object', capacity: '128 TB', used: '98 TB', utilPercent: '15%', iops: '3.2M', throughput: '64 GB/s', region: 'us-east-1', status: 'Live' },
];
