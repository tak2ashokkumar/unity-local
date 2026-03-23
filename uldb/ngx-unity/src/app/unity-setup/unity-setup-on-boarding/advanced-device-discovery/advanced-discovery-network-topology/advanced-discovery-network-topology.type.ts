export interface AdvancedDiscoveryTopology {
    nodes: AdvancedDiscoveryTopologyNode[];
    links: AdvancedDiscoveryTopologyLink[];
}
export interface AdvancedDiscoveryTopologyNode {
    id: number;
    name: string;
    ip_address: string;
    resource_type: string;
    onboarded_status: boolean;

    // added for UI purpose
    display_type: string;
    fa_icon: string;
}
export interface AdvancedDiscoveryTopologyLink {
    source_id: number;
    target_id: number;
}