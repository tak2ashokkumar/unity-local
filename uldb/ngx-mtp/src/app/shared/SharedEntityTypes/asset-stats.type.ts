export interface MTPTotalAssetCounts {
    total_inactive_assets: number;
    total_active_assets: number;
    total_assets: number;
}

export interface MTPAssetStats {
    count: number;
    unknown: number;
    name: string;
    active_count: number;
    inactive_count: number;
}